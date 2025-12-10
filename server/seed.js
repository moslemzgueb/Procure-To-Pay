const { sequelize, User } = require('./models');
const bcrypt = require('bcryptjs');

const seed = async () => {
    try {
        await sequelize.sync();

        const hashedPassword = await bcrypt.hash('password123', 10);

        const [user, created] = await User.findOrCreate({
            where: { username: 'testuser' },
            defaults: {
                password: hashedPassword,
                role: 'requester'
            }
        });

        if (created) {
            console.log('Test user created: testuser / password123');
        } else {
            console.log('Test user already exists');
        }

        const [approver, createdApprover] = await User.findOrCreate({
            where: { username: 'manager' },
            defaults: {
                password: hashedPassword,
                role: 'approver'
            }
        });

        if (createdApprover) {
            console.log('Approver created: manager / password123');
        } else {
            console.log('Approver already exists');
        }

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await sequelize.close();
    }
};

seed();
