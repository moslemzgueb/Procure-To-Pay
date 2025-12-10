const { sequelize, User, Validator, Entity, ApprovalRule } = require('../models');

async function setupMultiStep() {
    try {
        await sequelize.authenticate();

        // 1. Create/Ensure User for Salah
        let salahUser = await User.findOne({ where: { username: 'salah' } });
        if (!salahUser) {
            salahUser = await User.create({
                username: 'salah',
                email: 'salah@test.com',
                password: 'password', // Simple password for testing
                role: 'approver'
            });
            console.log('User "salah" created with password "password".');
        } else {
            console.log('User "salah" already exists.');
        }

        // 2. Link Validator "Salah ammar" (ID 1) to user Salah
        const salahValidator = await Validator.findByPk(1);
        if (salahValidator) {
            await salahValidator.update({ user_id: salahUser.id });
            console.log('Validator "Salah ammar" linked to User "salah".');
        } else {
            console.error('Validator ID 1 not found! Creating new one...');
            await Validator.create({
                name: 'Salah ammar',
                email: 'salah@test.com',
                user_id: salahUser.id,
                level: 'Level 2'
            });
        }

        // 3. Re-Add Step 2 Rule for "Moslem entity"
        const entity = await Entity.findOne({ where: { name: 'Moslem entity' } });
        if (entity) {
            // Check if Step 2 exists
            const existingRule = await ApprovalRule.findOne({
                where: { entity_id: entity.id, group_number: 2 }
            });

            if (!existingRule) {
                // Determine ID of Salah Validator
                const val = await Validator.findOne({ where: { user_id: salahUser.id } });

                await ApprovalRule.create({
                    entity_id: entity.id,
                    workflow_type: 'BUDGET',
                    group_number: 2,
                    approvers: [val.id],
                    logic: 'OR'
                });
                console.log('Re-added Step 2 for Moslem entity -> Salah ammar.');
            } else {
                console.log('Step 2 already exists.');
            }
        }

    } catch (error) {
        console.error(error);
    } finally {
        await sequelize.close();
    }
}

setupMultiStep();
