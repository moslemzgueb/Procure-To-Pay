const { sequelize, ApprovalRule, Validator, Entity, User } = require('../models');

async function fixRules() {
    try {
        await sequelize.authenticate();
        console.log('--- Fixing Rules for "Moslem entity" ---');

        // 1. Find the Entity "Moslem entity"
        const entity = await Entity.findOne({ where: { name: 'Moslem entity' } });
        if (!entity) {
            console.error('Entity "Moslem entity" not found!');
            return;
        }

        // 2. Find the Validator for the current user (assuming user_id 2 based on previous logs, name "Moslem Zgueb")
        // Previous logs: Validator ID 3 is Moslem Zgueb (user_id 2).
        // Let's verify by name just in case.
        const validator = await Validator.findOne({ where: { name: 'Moslem Zgueb' } });
        if (!validator) {
            console.error('Validator "Moslem Zgueb" not found!');
            return;
        }

        console.log(`Configuring rules for Entity: ${entity.name} (ID: ${entity.id})`);
        console.log(`Assigning to Validator: ${validator.name} (ID: ${validator.id})`);

        // 3. Clear existing rules for this entity
        await ApprovalRule.destroy({ where: { entity_id: entity.id } });
        console.log('Clients/Rules cleared.');

        // 4. Create Single Step Rule
        await ApprovalRule.create({
            entity_id: entity.id,
            workflow_type: 'BUDGET',
            group_number: 1,
            approvers: [validator.id],
            logic: 'OR'
        });

        console.log('✅ Rule created: Group 1 -> Moslem Zgueb');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

fixRules();
