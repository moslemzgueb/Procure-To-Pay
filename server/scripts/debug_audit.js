const { sequelize, Budget, Entity, ApprovalRule, ApprovalStep, Validator } = require('../models');

async function debugLastN() {
    try {
        await sequelize.authenticate();

        // 1. Get List of Recent Budgets
        const budgets = await Budget.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']],
            include: [{ model: Entity }]
        });

        console.log(`\n--- Last 5 Budgets ---`);
        for (const b of budgets) {
            console.log(`\n[Budget ID: ${b.id}] Entity: ${b.Entity?.name || 'N/A'}, Status: ${b.status}, Step: ${b.current_approval_step}`);

            // Get Steps
            const steps = await ApprovalStep.findAll({ where: { object_id: b.id, object_type: 'BUDGET' } });
            console.log(`  Steps: ${steps.length}`);
            steps.forEach(s => console.log(`    - ${s.decision} by Val ${s.approver_id}`));

            // Get Rules
            if (b.Entity) {
                const rules = await ApprovalRule.findAll({ where: { entity_id: b.entity_id } });
                console.log(`  Rules Groups: ${rules.map(r => r.group_number).join(',')}`);
            }
        }

    } catch (error) {
        console.error(error);
    } finally {
        await sequelize.close();
    }
}

debugLastN();
