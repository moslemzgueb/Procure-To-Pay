
const { User, Validator, Entity, sequelize } = require('./models');

async function addAdminValidator() {
    try {
        await sequelize.authenticate();
        console.log('Connected');

        const admin = await User.findOne({ where: { role: 'system_admin' } });
        if (!admin) {
            console.log('Admin user not found!');
            return;
        }

        // Check if validator already exists
        const existing = await Validator.findOne({ where: { user_id: admin.id } });
        if (existing) {
            console.log('Validator already exists for admin');
            return;
        }

        // Get an entity to link to (or first one)
        const entity = await Entity.findOne();

        await Validator.create({
            user_id: admin.id,
            name: 'System Admin Validator',
            email: admin.email || 'admin@example.com',
            entity_id: entity ? entity.id : 1, // Fallback
            approval_limit: 999999999 // High limit
        });

        console.log('Successfully created Validator record for Admin user.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

addAdminValidator();
