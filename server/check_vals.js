
const { User, Validator, sequelize } = require('./models');

async function checkValidators() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected');

        const users = await User.findAll();
        console.log('Users:', users.map(u => `${u.username} (${u.role}) id=${u.id}`));

        const validators = await Validator.findAll();
        console.log('Validators:', validators.map(v => `ValidatorID=${v.id} UserID=${v.user_id} Name=${v.name}`));

        // Check specifically for admin
        const admin = users.find(u => u.role === 'system_admin');
        if (admin) {
            const adminVal = validators.find(v => v.user_id === admin.id);
            console.log('Admin Validator Record:', adminVal ? 'FOUND' : 'MISSING');
        } else {
            console.log('No system_admin user found');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}

checkValidators();
