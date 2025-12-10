const { sequelize, ApprovalStep } = require('../models');

async function forceSync() {
    try {
        console.log('Forcing sync for ApprovalStep...');
        await ApprovalStep.sync({ force: true });
        console.log('✅ ApprovalStep synced.');

        const [fks] = await sequelize.query("PRAGMA foreign_key_list(ApprovalSteps);");
        console.log('FKs:', JSON.stringify(fks, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

forceSync();
