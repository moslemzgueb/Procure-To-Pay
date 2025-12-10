const { sequelize, ApprovalRule, Entity } = require('../models');

async function checkAF5Rules() {
    try {
        await sequelize.authenticate();
        const entity = await Entity.findOne({ where: { name: 'AF5' } });
        if (!entity) {
            console.log('AF5 not found');
            return;
        }

        const rules = await ApprovalRule.findAll({
            where: { entity_id: entity.id },
            order: [['group_number', 'ASC']]
        });

        console.log(`Rules for AF5 (ID: ${entity.id}):`);
        rules.forEach(r => {
            console.log(`- Group ${r.group_number}: Approvers ${JSON.stringify(r.approvers)}`);
        });

    } catch (error) {
        console.error(error);
    } finally {
        await sequelize.close();
    }
}

checkAF5Rules();
