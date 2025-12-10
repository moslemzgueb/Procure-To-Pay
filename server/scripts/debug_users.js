const { sequelize, User, Validator } = require('../models');
const { Op } = require('sequelize');

async function listUsers() {
    try {
        await sequelize.authenticate();
        console.log('--- Validators ---');
        const validators = await Validator.findAll({
            where: { id: { [Op.in]: [1, 3, 5] } }
        });

        for (const v of validators) {
            const user = await User.findByPk(v.user_id);
            console.log(`Validator ID: ${v.id}, Name: ${v.name}, User ID: ${v.user_id}, Username: ${user ? user.username : 'Unknown'}`);
        }

    } catch (error) {
        console.error(error);
    } finally {
        await sequelize.close();
    }
}

listUsers();
