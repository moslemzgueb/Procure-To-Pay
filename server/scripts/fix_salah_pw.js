const { sequelize, User } = require('../models');
const bcrypt = require('bcryptjs');

async function fixSalahPassword() {
    try {
        await sequelize.authenticate();

        const user = await User.findOne({ where: { username: 'salah' } });
        if (!user) {
            console.log('User "salah" not found!');
            return;
        }

        const hashedPassword = await bcrypt.hash('password', 10);

        await user.update({ password: hashedPassword });
        console.log('✅ Password for "salah" has been updated to a valid bcrypt hash.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

fixSalahPassword();
