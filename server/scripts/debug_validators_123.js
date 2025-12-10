const { sequelize, Validator } = require('../models');

async function listMoreValidators() {
    try {
        await sequelize.authenticate();
        console.log('--- Validators ---');
        const validators = await Validator.findAll({
            where: { id: [1, 2, 3] }
        });
        console.table(validators.map(v => ({ id: v.id, name: v.name, user_id: v.user_id })));
    } catch (error) {
        console.error(error);
    } finally {
        await sequelize.close();
    }
}

listMoreValidators();
