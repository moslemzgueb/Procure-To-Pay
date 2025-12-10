const { ApprovalRule, ApprovalStep, User, Budget, PaymentRequest, Validator } = require('../models');
const { Op } = require('sequelize');
const emailService = require('./emailService');

console.log('LOADING APPROVAL SERVICE V2 - WITH NULL CHECKS');

class ApprovalService {
    /**
     * Submit an object for approval.
     * Finds matching rules and sends notifications to first group validators.
     */
    async submitForApproval(objectType, objectId, entityId, initiatorId) {
        const workflowType = objectType.toUpperCase() === 'BUDGET' ? 'BUDGET' : 'PAYMENT';

        const rules = await ApprovalRule.findAll({
            where: {
                entity_id: entityId,
                workflow_type: workflowType
            },
            order: [['group_number', 'ASC']]
        });

        if (rules.length === 0) {
            await this.updateObjectStatus(objectType, objectId, 'APPROVED');
            return { status: 'APPROVED', message: 'No approval rules found, auto-approved.' };
        }

        await this.updateObjectStatus(objectType, objectId, 'SUBMITTED');

        // Notify first group validators
        await this.notifyGroupValidators(rules[0], objectType, objectId, entityId);

        // Update current step
        await this.updateObjectStep(objectType, objectId, rules[0].group_number);

        return { status: 'SUBMITTED', nextGroup: rules[0].group_number };
    }

    /**
     * Notify validators in a specific group
     */
    async notifyGroupValidators(rule, objectType, objectId, entityId) {
        try {
            const object = await this.getObject(objectType, objectId);
            const entity = await object.getEntity();

            // Get validators for this group
            const validatorIds = rule.approvers || [];
            const validators = await Validator.findAll({
                where: { id: { [Op.in]: validatorIds }, isActive: true }
            });

            // Send email to each validator
            for (const validator of validators) {
                try {
                    await emailService.sendApprovalNotification(
                        validator,
                        objectType,
                        objectId,
                        entity.name,
                        object.total_budget_local || object.amount_local || 0
                    );
                } catch (error) {
                    console.error(`Failed to send email to ${validator.email}:`, error);
                }
            }

            console.log(`Notified ${validators.length} validators for group ${rule.group_number}`);
        } catch (error) {
            console.error('Error notifying validators:', error);
        }
    }

    /**
     * Process an approval action.
     */
    async approveV2(objectType, objectId, approverId) {
        console.log('DEBUG: Entering approve method');
        console.log('DEBUG: Arguments:', { objectType, objectId, approverId });

        console.log('DEBUG: Creating ApprovalStep:', { objectType, objectId, approverId, decision: 'APPROVED' });
        // Record the approval step
        await ApprovalStep.create({
            object_type: objectType,
            object_id: objectId,
            approver_id: approverId,
            decision: 'APPROVED',
            decision_date: new Date()
        });

        console.log('DEBUG: Calling getObject...');
        const object = await this.getObject(objectType, objectId);
        console.log('DEBUG: getObject returned:', object ? 'Object found' : 'NULL');

        console.log('DEBUG: Accessing entity_id...');
        const entityId = object.entity_id;
        console.log('DEBUG: entityId:', entityId);

        const workflowType = objectType.toUpperCase() === 'BUDGET' ? 'BUDGET' : 'PAYMENT';

        const rules = await ApprovalRule.findAll({
            where: { entity_id: entityId, workflow_type: workflowType },
            order: [['group_number', 'ASC']]
        });

        const approvals = await ApprovalStep.findAll({
            where: {
                object_type: objectType,
                object_id: objectId,
                decision: 'APPROVED'
            }
        });

        // Group rules by group_number
        const groups = {};
        rules.forEach(r => {
            if (!groups[r.group_number]) groups[r.group_number] = [];
            groups[r.group_number].push(r);
        });

        let allGroupsSatisfied = true;
        let nextGroup = null;
        let currentGroupSatisfied = false;

        // Check if approver is System Admin
        const approverValidator = await Validator.findByPk(approverId, { include: [User] });
        const isSystemAdmin = approverValidator?.User?.role === 'system_admin';

        if (isSystemAdmin) {
            console.log('System Admin Override: Approving immediately.');
            allGroupsSatisfied = true;
        } else {
            // Check each group in order
            for (const groupNum of Object.keys(groups).sort((a, b) => a - b)) {
                const groupRules = groups[groupNum];

                // Get all approver IDs from all rules in this group
                const groupApproverIds = [];
                groupRules.forEach(r => {
                    if (Array.isArray(r.approvers)) {
                        groupApproverIds.push(...r.approvers);
                    }
                });

                // Check if ANY approver in this group has approved (OR logic)
                const hasApproved = approvals.some(a => groupApproverIds.includes(a.approver_id));

                if (!hasApproved) {
                    allGroupsSatisfied = false;
                    nextGroup = groupNum;
                    break;
                } else if (groupNum == groupRules[0].group_number) {
                    // Current group just got satisfied
                    currentGroupSatisfied = true;
                }
            }
        }

        if (allGroupsSatisfied) {
            // All groups approved - mark as APPROVED
            await this.updateObjectStatus(objectType, objectId, 'APPROVED');

            // Notify initiator
            const initiator = await User.findByPk(object.initiator_id);
            const approver = await User.findByPk(approverId);
            if (initiator) {
                try {
                    await emailService.sendApprovalStatusUpdate(
                        initiator.email || initiator.username, // Try email, fallback to username
                        objectType,
                        objectId,
                        'APPROVED',
                        approver?.username || 'Approver'
                    );
                } catch (error) {
                    console.error('Failed to send approval notification:', error);
                }
            }

            return { status: 'APPROVED' };
        } else {
            // Check if we just satisfied a group and need to notify next group
            if (currentGroupSatisfied && nextGroup) {
                const nextGroupRules = groups[nextGroup];
                if (nextGroupRules && nextGroupRules.length > 0) {
                    await this.notifyGroupValidators(nextGroupRules[0], objectType, objectId, entityId);
                    await this.updateObjectStep(objectType, objectId, nextGroup);
                }
            }

            return { status: 'SUBMITTED', waitingForGroup: nextGroup };
        }
    }

    async reject(objectType, objectId, approverId, comment) {
        await ApprovalStep.create({
            object_type: objectType,
            object_id: objectId,
            approver_id: approverId,
            decision: 'REJECTED',
            comments: comment,
            decision_date: new Date()
        });

        await this.updateObjectStatus(objectType, objectId, 'REJECTED');

        // Notify initiator
        const object = await this.getObject(objectType, objectId);
        const initiator = await User.findByPk(object.initiator_id);
        const approver = await User.findByPk(approverId);
        if (initiator) {
            try {
                await emailService.sendApprovalStatusUpdate(
                    initiator.username,
                    objectType,
                    objectId,
                    'REJECTED',
                    approver?.username || 'Approver'
                );
            } catch (error) {
                console.error('Failed to send rejection notification:', error);
            }
        }

        return { status: 'REJECTED' };
    }

    async requestInfo(objectType, objectId, approverId, comment) {
        await ApprovalStep.create({
            object_type: objectType,
            object_id: objectId,
            approver_id: approverId,
            decision: 'INFO_REQUESTED',
            comments: comment,
            decision_date: new Date()
        });

        return { status: 'SUBMITTED', message: 'Info requested' };
    }

    // Helper to get object
    async getObject(objectType, objectId) {
        let object;
        if (objectType.toUpperCase() === 'BUDGET') {
            object = await Budget.findByPk(objectId);
        } else {
            object = await PaymentRequest.findByPk(objectId);
        }

        if (!object) {
            throw new Error(`Object not found: ${objectType} with ID ${objectId}`);
        }
        return object;
    }

    // Helper to update status
    async updateObjectStatus(objectType, objectId, status) {
        if (objectType.toUpperCase() === 'BUDGET') {
            await Budget.update({ status }, { where: { id: objectId } });
        } else {
            await PaymentRequest.update({ status }, { where: { id: objectId } });
        }
    }

    // Helper to update current approval step
    async updateObjectStep(objectType, objectId, step) {
        if (objectType.toUpperCase() === 'BUDGET') {
            await Budget.update({ current_approval_step: step }, { where: { id: objectId } });
        } else {
            await PaymentRequest.update({ current_approval_step: step }, { where: { id: objectId } });
        }
    }
}

console.log('METHODS:', Object.getOwnPropertyNames(ApprovalService.prototype));

module.exports = new ApprovalService();
