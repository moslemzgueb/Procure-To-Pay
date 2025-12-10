const { sequelize } = require('../models');

async function dropApprovalSteps() {
    try {
        console.log('Dropping ApprovalSteps table...');
        await sequelize.getQueryInterface().dropTable('ApprovalSteps');
        console.log('✅ Table dropped successfully.');
    } catch (error) {
        console.error('Error dropping table:', error);
    } finally {
        await sequelize.close();
    }
}

dropApprovalSteps();
