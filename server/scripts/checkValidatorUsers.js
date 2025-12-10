const { sequelize, Validator, User } = require('../models');

sequelize.options.logging = false;

async function checkValidatorUsers() {
    try {
        console.log('=== VALIDATOR-USER MAPPING ===\n');

        const validators = await Validator.findAll();

        for (const v of validators) {
            console.log(`Validator ID: ${v.id}`);
            console.log(`  Email: ${v.email}`);
            console.log(`  User ID: ${v.user_id}`);

            if (v.user_id) {
                const user = await User.findByPk(v.user_id);
                if (user) {
                    console.log(`  ✅ User exists: ${user.username} (ID: ${user.id}, Role: ${user.role})`);
                } else {
                    console.log(`  ❌ User ID ${v.user_id} not found!`);
                }
            } else {
                console.log(`  ❌ No user_id set!`);
            }
            console.log('');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await sequelize.close();
    }
}

checkValidatorUsers();
