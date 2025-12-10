const { sequelize, User } = require('../models');
const bcrypt = require('bcryptjs');

async function createAdmin() {
    try {
        await sequelize.authenticate();

        const adminUsername = 'admin';
        const adminPassword = 'password';

        let admin = await User.findOne({ where: { username: adminUsername } });

        if (admin) {
            console.log(`User "${adminUsername}" already exists. Updating role and password...`);
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            await admin.update({
                password: hashedPassword,
                role: 'system_admin',
                email: 'admin@test.com'
            });
            console.log(`✅ User "${adminUsername}" updated to system_admin.`);
        } else {
            console.log(`Creating user "${adminUsername}"...`);
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            admin = await User.create({
                username: adminUsername,
                password: hashedPassword,
                role: 'system_admin',
                email: 'admin@test.com'
            });
            console.log(`✅ User "${adminUsername}" created as system_admin.`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

createAdmin();
