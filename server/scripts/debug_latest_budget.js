const { sequelize, Budget, Entity, ApprovalRule, ApprovalStep, Validator } = require('../models');

async function debugLatest() {
    try {
        await sequelize.authenticate();

        // 1. Get Latest Budget
        const budget = await Budget.findOne({
            order: [['createdAt', 'DESC']],
            include: [{ model: Entity }]
        });

        if (!budget) {
            console.log('No budgets found.');
            return;
        }

        console.log(`\n--- Latest Budget ---`);
        console.log(`ID: ${budget.id}`);
        console.log(`Entity: ${budget.Entity.name} (ID: ${budget.entity_id})`);
        console.log(`Status: ${budget.status}`);
        console.log(`Current Step: ${budget.current_approval_step}`);
        console.log(`Created At: ${budget.createdAt}`);

        // 2. Get Rules for this Entity
        const rules = await ApprovalRule.findAll({
            where: { entity_id: budget.entity_id },
            order: [['group_number', 'ASC']]
        });

        console.log(`\n--- Rules for Entity ${budget.entity_id} ---`);
        if (rules.length === 0) {
            console.log('NO RULES FOUND!');
        } else {
            rules.forEach(r => {
                console.log(`Group ${r.group_number}: Approvers ${JSON.stringify(r.approvers)}, Logic: ${r.logic}`);
            });
        }

        // 3. Get Approval Steps for this Budget
        const steps = await ApprovalStep.findAll({
            where: { object_id: budget.id, object_type: 'BUDGET' },
            order: [['createdAt', 'ASC']]
        });

        console.log(`\n--- Approval Steps ---`);
        steps.forEach(s => {
            console.log(`- Action: ${s.decision} by Validator ${s.approver_id} at ${s.createdAt}`);
        });

    } catch (error) {
        console.error(error);
    } finally {
        await sequelize.close();
    }
}

debugLatest();
