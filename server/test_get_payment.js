const { PaymentRequest, Budget, Entity, Vendor, User } = require('./models');

async function testGetPayment() {
    try {
        // First, let's see what payments exist
        const allPayments = await PaymentRequest.findAll({
            attributes: ['id', 'status', 'entity_id', 'vendor_id', 'initiator_id']
        });

        console.log('All payments in database:');
        allPayments.forEach(p => {
            console.log(`  ID: ${p.id}, status: ${p.status}, entity: ${p.entity_id}, vendor: ${p.vendor_id}, initiator: ${p.initiator_id}`);
        });

        if (allPayments.length === 0) {
            console.log('\nNo payments found in database!');
            return;
        }

        // Try to get first payment with includes
        const paymentId = allPayments[0].id;
        console.log(`\nTrying to fetch payment ${paymentId} with includes...`);

        // Test each include separately to find the problem
        console.log('\n1. Testing Entity include...');
        try {
            const p1 = await PaymentRequest.findByPk(paymentId, {
                include: [{ model: Entity, attributes: ['name'] }]
            });
            console.log('✓ Entity include works');
        } catch (e) {
            console.log('✗ Entity include failed:', e.message);
        }

        console.log('\n2. Testing Vendor include...');
        try {
            const p2 = await PaymentRequest.findByPk(paymentId, {
                include: [{ model: Vendor, attributes: ['name'], required: false }]
            });
            console.log('✓ Vendor include works');
        } catch (e) {
            console.log('✗ Vendor include failed:', e.message);
        }

        console.log('\n3. Testing Budget include...');
        try {
            const p3 = await PaymentRequest.findByPk(paymentId, {
                include: [{ model: Budget, attributes: ['product_service_name', 'deal_name'], required: false }]
            });
            console.log('✓ Budget include works');
        } catch (e) {
            console.log('✗ Budget include failed:', e.message);
        }

        console.log('\n4. Testing User (Initiator) include...');
        try {
            const p4 = await PaymentRequest.findByPk(paymentId, {
                include: [{ model: User, as: 'Initiator', attributes: ['username'], required: false }]
            });
            console.log('✓ User include works');
        } catch (e) {
            console.log('✗ User include failed:', e.message);
        }

        console.log('\n5. Testing all includes together...');
        const payment = await PaymentRequest.findByPk(paymentId, {
            include: [
                { model: Entity, attributes: ['name'] },
                { model: Vendor, attributes: ['name'], required: false },
                { model: Budget, attributes: ['product_service_name', 'deal_name'], required: false },
                { model: User, as: 'Initiator', attributes: ['username'], required: false }
            ]
        });

        if (payment) {
            console.log('SUCCESS! Payment retrieved:');
            console.log(JSON.stringify(payment.toJSON(), null, 2));
        } else {
            console.log('Payment not found');
        }

    } catch (error) {
        console.error('ERROR:', error.message);
        if (error.original) console.error('SQL Error:', error.original);
        console.error('Stack:', error.stack);
    }
}

testGetPayment();
