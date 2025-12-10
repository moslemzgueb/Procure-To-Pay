const { sequelize, ApprovalRule, Entity, Validator, User, Budget } = require('../models');

async function listRules() {
    try {
        await sequelize.authenticate();
        console.log('--- Approval Rules ---');
        const rules = await ApprovalRule.findAll({
            include: [
                { model: Entity, attributes: ['name'] }
            ],
            order: [['entity_id', 'ASC'], ['group_number', 'ASC']]
        });

        for (const rule of rules) {
            console.log(`Entity: ${rule.Entity.name} (ID: ${rule.entity_id}), Group: ${rule.group_number}, Workflow: ${rule.workflow_type}`);
            console.log(`Approvers JSON: ${JSON.stringify(rule.approvers)}`);
        }

        console.log('\n--- Budgets in Progress ---');
        const budgets = await Budget.findAll({
            where: { status: 'SUBMITTED' },
            include: [{ model: Entity, attributes: ['name'] }]
        });

        for (const b of budgets) {
            console.log(`Budget ID: ${b.id}, Entity: ${b.Entity.name}, Step: ${b.current_approval_step}`);
        }

    } catch (error) {
        console.error(error);
    } finally {
        await sequelize.close();
    }
}

listRules();
