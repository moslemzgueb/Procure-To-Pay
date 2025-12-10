const { Budget, PaymentRequest, ApprovalRule, ApprovalStep, Entity, Vendor, User, Validator } = require('../models');
const { Op } = require('sequelize');

exports.getMyTasks = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find the validator profile for this user
        const validator = await Validator.findOne({ where: { user_id: userId } });

        if (!validator) {
            return res.json({ budgets: [], payments: [] });
        }

        // Find ALL approval rules (we'll filter in JavaScript)
        const allRules = await ApprovalRule.findAll();

        // Map entity_id -> list of group_numbers where this validator is an approver
        const validatorGroupsByEntity = {};
        allRules.forEach(rule => {
            if (!validatorGroupsByEntity[rule.entity_id]) {
                validatorGroupsByEntity[rule.entity_id] = [];
            }
            // Check if validator is actually in the approvers list (double check due to LIKE query)
            if (Array.isArray(rule.approvers) && rule.approvers.includes(validator.id)) {
                validatorGroupsByEntity[rule.entity_id].push(rule.group_number);
            }
        });

        const entityIds = Object.keys(validatorGroupsByEntity);

        // Find budgets that are SUBMITTED, belong to these entities, AND are at the right step
        const budgets = await Budget.findAll({
            where: {
                entity_id: { [Op.in]: entityIds },
                status: 'SUBMITTED'
            },
            include: [
                { model: Entity, attributes: ['name'] },
                { model: Vendor, attributes: ['name'] },
                { model: User, as: 'Initiator', attributes: ['username'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Filter budgets where the current_approval_step matches one of the validator's groups
        const myTasks = budgets.filter(budget => {
            const allowedGroups = validatorGroupsByEntity[budget.entity_id] || [];
            return allowedGroups.includes(budget.current_approval_step);
        }).map(budget => ({
            ...budget.toJSON(),
            waitingForGroup: budget.current_approval_step,
            canApprove: true,
            type: 'BUDGET'
        }));

        // Find payments that are SUBMITTED, belong to these entities, AND are at the right step
        const payments = await PaymentRequest.findAll({
            where: {
                entity_id: { [Op.in]: entityIds },
                status: 'SUBMITTED'
            },
            include: [
                { model: Entity, attributes: ['name'] },
                { model: Vendor, attributes: ['name'] },
                { model: User, as: 'Initiator', attributes: ['username'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Filter payments where the current_approval_step matches one of the validator's groups
        const myPaymentTasks = payments.filter(payment => {
            const allowedGroups = validatorGroupsByEntity[payment.entity_id] || [];
            return allowedGroups.includes(payment.current_approval_step);
        }).map(payment => ({
            ...payment.toJSON(),
            waitingForGroup: payment.current_approval_step,
            canApprove: true,
            type: 'PAYMENT'
        }));

        // Combine both budgets and payments
        const allTasks = [...myTasks, ...myPaymentTasks];

        res.json({ tasks: allTasks, count: allTasks.length });
    } catch (error) {
        console.error('Error fetching my tasks:', error);
        res.status(500).json({ message: 'Error fetching tasks', error: error.message });
    }
};
