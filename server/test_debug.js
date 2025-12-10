const { sequelize, PaymentRequest, Entity, Vendor, Budget, User } = require('./models');

async function testPaymentQuery() {
    try {
        console.log('Testing query for Payment ID 2...');
        const payment = await PaymentRequest.findByPk(2, {
            include: [
                { model: Entity, attributes: ['name'] },
                { model: Vendor, attributes: ['name'], required: false },
                { model: Budget, attributes: ['product_service_name', 'deal_name', 'remaining_budget', 'status', 'id'], required: false },
                { model: User, as: 'Initiator', attributes: ['username'], required: false }
            ]
        });

        if (payment) {
            console.log('Payment found:', payment.toJSON());
        } else {
            console.log('Payment not found (null result)');
        }
    } catch (error) {
        console.error('CRASHED!');
        console.error(error);
    } finally {
        await sequelize.close();
    }
}

testPaymentQuery();
