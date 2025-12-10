const { sequelize } = require('../models');

async function addColumn() {
    try {
        console.log('Adding current_approval_step column to Budgets table...');
        await sequelize.query("ALTER TABLE Budgets ADD COLUMN current_approval_step INTEGER DEFAULT 0;");
        console.log('Column added successfully.');
    } catch (error) {
        console.error('Error adding column:', error);
    } finally {
        await sequelize.close();
    }
}

addColumn();
