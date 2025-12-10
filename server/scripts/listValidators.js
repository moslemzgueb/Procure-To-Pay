const { sequelize, Validator } = require('../models');

sequelize.options.logging = false;

async function listAll() {
    try {
        const validators = await Validator.findAll();
        console.log(`Total validators: ${validators.length}\n`);

        for (const v of validators) {
            console.log(`ID: ${v.id}, Email: ${v.email}, Name: ${v.name}, UserID: ${v.user_id}`);
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await sequelize.close();
    }
}

listAll();
