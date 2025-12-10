const { sequelize, PaymentRequest, Entity, Vendor, Budget, User } = require('./models');

async function verifyFix() {
    try {
        console.log('Verifying Payment Query Fix...');
        // This is the fixed query structure (without remaining_budget)
        const payment = await PaymentRequest.findByPk(2, {
            include: [
                { model: Entity, attributes: ['name'] },
                { model: Vendor, attributes: ['name'], required: false },
                { model: Budget, attributes: ['product_service_name', 'deal_name', 'status', 'id'], required: false },
                { model: User, as: 'Initiator', attributes: ['username'], required: false }
            ]
        });

        if (payment) {
            console.log('SUCCESS: Payment found and query executed without error.');
            console.log('Payment Data:', payment.toJSON());
        } else {
            console.log('Payment 2 not found (but query did not crash).');
        }
    } catch (error) {
        console.error('FAILURE: Query still crashed!');
        console.error(error);
    } finally {
        await sequelize.close();
    }
}

verifyFix();
