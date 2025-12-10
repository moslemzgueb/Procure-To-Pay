const { sequelize, Budget, PaymentRequest } = require('../models');

async function clearBudgets() {
    try {
        console.log('Starting to clear budgets...');

        // Delete PaymentRequests first due to foreign key constraints
        const deletedPayments = await PaymentRequest.destroy({ where: {} });
        console.log(`Deleted ${deletedPayments} payment requests.`);

        // Delete Budgets
        const deletedBudgets = await Budget.destroy({ where: {} });
        console.log(`Deleted ${deletedBudgets} budgets.`);

        console.log('Successfully cleared budget tables.');
    } catch (error) {
        console.error('Error clearing budgets:', error);
    } finally {
        await sequelize.close();
    }
}

clearBudgets();
