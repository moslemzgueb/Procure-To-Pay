const { ApprovalStep, Validator, Budget, ApprovalRule, Entity } = require('../models');
const approvalService = require('../services/approvalService');

async function testApprove() {
    try {
        console.log('=== TESTING APPROVE WORKFLOW ===\n');

        // Simulate what the controller does
        const userId = 2; // moslemzgueb@gmail.com
        const objectType = 'Budget';
        const objectId = 4;

        console.log(`1. Finding validator for user ${userId}...`);
        const validator = await Validator.findOne({ where: { user_id: userId } });

        if (!validator) {
            console.log('❌ User is not a validator');
            return;
        }

        console.log(`✅ Validator found: ID ${validator.id}\n`);

        console.log(`2. Converting objectType to uppercase...`);
        const upperObjectType = objectType.toUpperCase();
        console.log(`   ${objectType} -> ${upperObjectType}\n`);

        console.log(`3. Calling approvalService.approve()...`);
        const result = await approvalService.approve(upperObjectType, objectId, validator.id);

        console.log('\n✅ APPROVAL SUCCESSFUL!');
        console.log('Result:', JSON.stringify(result, null, 2));

    } catch (error) {
        console.error('\n❌ APPROVAL FAILED!');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        if (error.original) console.error('Original:', error.original);
        if (error.sql) console.error('SQL:', error.sql);
    }
}

testApprove();
