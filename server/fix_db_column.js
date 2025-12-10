
const { sequelize } = require('./models');

async function fix() {
    try {
        await sequelize.authenticate();
        console.log('Connected');

        // Try adding the column. If it fails, catch error (maybe it exists).
        try {
            await sequelize.query("ALTER TABLE PaymentRequests ADD COLUMN current_approval_step INTEGER DEFAULT NULL;");
            console.log("Column 'current_approval_step' added successfully.");
        } catch (e) {
            console.log("Could not add column (might already exist):", e.message);
        }

    } catch (error) {
        console.error('Fatal error:', error);
    } finally {
        await sequelize.close();
    }
}

fix();
