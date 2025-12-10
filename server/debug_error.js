
const { Budget, PaymentRequest, Entity, Vendor, User, sequelize } = require('./models');
const { Op } = require('sequelize');

async function test() {
    try {
        await sequelize.authenticate();
        console.log('DB Connection OK');

        // Mock request user
        const user = { id: 1, role: 'system_admin' }; // Try as admin first

        const where = {};
        // Filter by initiator for non-admin users (test logic)
        if (user.role === 'initiator') {
            where.initiator_id = user.id;
        }

        console.log('Querying Budgets...');
        const budgets = await Budget.findAll({
            where,
            include: [
                { model: Entity, attributes: ['name'] },
                { model: Vendor, attributes: ['name'] },
                { model: User, as: 'Initiator', attributes: ['username'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        console.log(`Found ${budgets.length} budgets.`);

        if (budgets.length > 0) {
            console.log('Enriching first budget...');
            const budget = budgets[0];
            const payments = await PaymentRequest.findAll({
                where: { linked_budget_id: budget.id }
            });
            console.log(`Found ${payments.length} payments for budget ${budget.id}`);
        }

    } catch (error) {
        console.error('ERROR CAUGHT:');
        console.error(error);
    } finally {
        await sequelize.close();
    }
}

test();
