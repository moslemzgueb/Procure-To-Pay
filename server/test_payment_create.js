const { PaymentRequest, Budget, Entity, Vendor, User } = require('./models');

async function testPaymentCreation() {
    try {
        // Find an approved budget
        const budget = await Budget.findOne({ where: { status: 'APPROVED' } });
        if (!budget) {
            console.log('No approved budget found');
            return;
        }

        console.log('Using budget:', budget.id, budget.deal_name);
        console.log('Budget entity_id:', budget.entity_id);
        console.log('Budget vendor_id:', budget.vendor_id);

        // Try to create a payment like the form would
        const testData = {
            linked_budget_id: budget.id,
            entity_id: budget.entity_id,
            vendor_id: budget.vendor_id || null,
            initiator_id: 6, // admin user
            product_service_description: 'Test Payment',
            invoice_date: '2025-12-09',
            invoice_number: 'TEST-001',
            period_start: null,
            period_end: null,
            currency: budget.currency || 'USD',
            amount_local: 100,
            amount_reporting: 110,
            status: 'DRAFT'
        };

        console.log('Creating payment with data:', testData);

        const payment = await PaymentRequest.create(testData);
        console.log('SUCCESS! Payment created:', payment.id);

        // Clean up
        await payment.destroy();
        console.log('Test payment deleted');

    } catch (error) {
        console.error('ERROR creating payment:', error.message);
        if (error.original) console.error('SQL Error:', error.original);
    }
}

testPaymentCreation();
