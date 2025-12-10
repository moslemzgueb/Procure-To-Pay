const { sequelize, User, Validator, Entity, Budget, ApprovalRule, ApprovalStep } = require('../models');
const approvalService = require('../services/approvalService');

async function runDebug() {
    try {
        console.log('--- Starting Debug Script ---');
        await sequelize.authenticate();
        console.log('DB Connected.');
        // await sequelize.sync({ alter: true });
        console.log('DB Synced (Skipped alter).');

        // 1. Setup Data
        // Create/Find User & Validator 1 (existing debug_admin)
        let user = await User.findOne({ where: { username: 'debug_admin' } });
        if (!user) {
            user = await User.create({ username: 'debug_admin', email: 'debug@test.com', password: 'password', role: 'admin' });
        }
        let validator = await Validator.findOne({ where: { user_id: user.id } });
        if (!validator) {
            validator = await Validator.create({
                name: 'Debug Validator',
                email: 'debug@test.com',
                user_id: user.id
            });
        }

        // Create/Find Validator 2
        let validator2 = await Validator.findOne({ where: { user_id: 999 } });
        if (!validator2) {
            const user2 = await User.create({ username: 'debug_admin2', email: 'debug2@test.com', password: 'password', role: 'admin' });
            validator2 = await Validator.create({
                name: 'Debug Validator 2',
                email: 'debug2@test.com',
                user_id: user2.id
            });
        }

        // Create Entity
        let entity = await Entity.findOne({ where: { name: 'Debug Entity' } });
        if (!entity) {
            entity = await Entity.create({ name: 'Debug Entity', type: 'OTHER' });
        }

        // Create Rules
        await ApprovalRule.destroy({ where: { entity_id: entity.id } }); // Clear existing

        await ApprovalRule.create({
            entity_id: entity.id,
            workflow_type: 'BUDGET',
            group_number: 1,
            approvers: [validator.id],
            logic: 'OR'
        });
        await ApprovalRule.create({
            entity_id: entity.id,
            workflow_type: 'BUDGET',
            group_number: 2,
            approvers: [validator2.id],
            logic: 'OR'
        });
        console.log('Created Approval Rules (Step 1 & 2 distinct).');

        // Create Budget
        const budget = await Budget.create({
            entity_id: entity.id,
            initiator_id: user.id,
            product_service_name: 'Debug Budget Multi',
            total_budget_local: 1000,
            status: 'SUBMITTED',
            current_approval_step: 1
        });
        console.log(`Created Budget ID: ${budget.id}`);

        // 3. Trigger Approve Step 1
        console.log(`Attempting to approve Budget ${budget.id} by Validator 1...`);
        let result = await approvalService.approveV2('BUDGET', budget.id, validator.id);
        console.log('Result 1:', result);

        if (result.status !== 'SUBMITTED') {
            console.error('FAIL: Should stay SUBMITTED');
        } else {
            console.log('PASS: Stayed SUBMITTED');
        }

        // 4. Trigger Approve Step 2
        console.log(`Attempting to approve Budget ${budget.id} by Validator 2...`);
        result = await approvalService.approveV2('BUDGET', budget.id, validator2.id);
        console.log('Result 2:', result);

        if (result.status !== 'APPROVED') {
            console.error('FAIL: Should be APPROVED');
        } else {
            console.log('PASS: Became APPROVED');
        }

    } catch (error) {
        console.error('!!! CAUGHT ERROR !!!');
        console.error(error);
        if (error.original) console.error('Original:', error.original);
    } finally {
        await sequelize.close();
    }
}

runDebug();
