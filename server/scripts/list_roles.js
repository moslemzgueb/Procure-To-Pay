const { sequelize, User, Validator } = require('../models');

async function listUsersAndRoles() {
    try {
        await sequelize.authenticate();
        console.log('\n--- SYSTEM USERS ---');
        const users = await User.findAll({
            attributes: ['id', 'username', 'role', 'email']
        });
        console.table(users.map(u => u.toJSON()));

        console.log('\n--- VALIDATORS (Approvers) ---');
        const validators = await Validator.findAll({
            include: [{ model: User, attributes: ['username'] }]
        });
        validators.forEach(v => {
            console.log(`Validator: ${v.name} (Level: ${v.level}) -> Linked User: ${v.User ? v.User.username : 'NONE'}`);
        });

    } catch (error) {
        console.error(error);
    } finally {
        await sequelize.close();
    }
}

listUsersAndRoles();
