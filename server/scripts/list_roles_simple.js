const { sequelize, User, Validator } = require('../models');

async function listUsersAndRoles() {
    try {
        await sequelize.authenticate();
        console.log('\n--- SYSTEM USERS ---');
        const users = await User.findAll({
            attributes: ['id', 'username', 'role', 'email']
        });
        // Use JSON stringify for reliable output capture
        console.log(JSON.stringify(users, null, 2));

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
