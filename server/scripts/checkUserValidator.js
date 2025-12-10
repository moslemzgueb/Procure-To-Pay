const { sequelize, User, Validator } = require('../models');

sequelize.options.logging = false;

async function checkUserValidatorMapping() {
    try {
        console.log('=== USER-VALIDATOR MAPPING ===\n');

        const user = await User.findOne({ where: { username: 'moslemzgueb@gmail.com' } });

        if (!user) {
            console.log('❌ User not found!');
            return;
        }

        console.log(`User ID: ${user.id}`);
        console.log(`Username: ${user.username}`);
        console.log(`Role: ${user.role}\n`);

        const validator = await Validator.findOne({ where: { user_id: user.id } });

        if (!validator) {
            console.log('❌ No validator linked to this user!');
            console.log('\nThe approve endpoint receives req.user.id (User ID)');
            console.log('But approvalService.approve expects approverId (Validator ID)');
            console.log('\nThis is the bug!');
        } else {
            console.log(`✅ Validator ID: ${validator.id}`);
            console.log(`Validator Email: ${validator.email}`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkUserValidatorMapping();
