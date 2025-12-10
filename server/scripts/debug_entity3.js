const { sequelize, ApprovalRule, Entity, Validator, User } = require('../models');

async function checkEntity3Rules() {
    try {
        await sequelize.authenticate();
        const rules = await ApprovalRule.findAll({
            where: { entity_id: 3 }, // Moslem entity
            order: [['group_number', 'ASC']]
        });

        console.log(`Rules for Entity 3 (Moslem entity):`);
        for (const r of rules) {
            console.log(`- Group ${r.group_number}: Approvers IDs ${JSON.stringify(r.approvers)}`);
            // Fetch names
            if (r.approvers && r.approvers.length > 0) {
                const validators = await Validator.findAll({ where: { id: r.approvers } });
                const names = validators.map(v => `${v.name} (ID: ${v.id})`).join(', ');
                console.log(`  Names: ${names}`);
            }
        }

    } catch (error) {
        console.error(error);
    } finally {
        await sequelize.close();
    }
}

checkEntity3Rules();
