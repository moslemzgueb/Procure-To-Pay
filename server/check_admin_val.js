const { User, Validator } = require('./models');

async function checkAdminValidator() {
    const admin = await User.findOne({ where: { role: 'system_admin' } });
    if (!admin) {
        console.log('No system_admin found');
        return;
    }
    console.log('Admin User:', admin.username, admin.id);

    const validator = await Validator.findOne({ where: { user_id: admin.id } });
    if (validator) {
        console.log('Admin IS a validator:', validator.id);
    } else {
        console.log('Admin IS NOT a validator');
    }
}

checkAdminValidator();
