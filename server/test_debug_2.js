const { sequelize, PaymentRequest, Entity, Vendor, Budget, User } = require('./models');

async function testDebug() {
    try {
        console.log('1. Testing User fetch...');
        const user = await User.findOne();
        if (user) console.log('User found:', user.toJSON());
        else console.log('No user found');

        console.log('2. Testing Payment fetch (no include)...');
        const payment = await PaymentRequest.findByPk(2);
        if (payment) console.log('Payment (base) found');
        else console.log('Payment 2 not found');

        if (payment) {
            console.log('3. Testing Payment + Entity...');
            await PaymentRequest.findByPk(2, { include: [{ model: Entity, attributes: ['name'] }] });
            console.log('Payment + Entity OK');

            console.log('4. Testing Payment + User (Initiator)...');
            await PaymentRequest.findByPk(2, { include: [{ model: User, as: 'Initiator', attributes: ['username'] }] });
            console.log('Payment + User OK');

            console.log('5. Testing Payment + Vendor...');
            await PaymentRequest.findByPk(2, { include: [{ model: Vendor, attributes: ['name'] }] });
            console.log('Payment + Vendor OK');

            console.log('6. Testing Payment + Budget...');
            await PaymentRequest.findByPk(2, { include: [{ model: Budget, attributes: ['id'] }] });
            console.log('Payment + Budget OK');
        }

    } catch (error) {
        console.error('CRASHED at step!');
        console.error(error);
    } finally {
        await sequelize.close();
    }
}

testDebug();
