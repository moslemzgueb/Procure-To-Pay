const { ApprovalStep, Validator } = require('../models');

async function reproduce() {
    try {
        console.log('Attempting to create ApprovalStep...');

        // Data from logs
        const data = {
            object_type: 'BUDGET',
            object_id: 4,
            approver_id: 3,
            decision: 'APPROVED',
            decision_date: new Date() // This will be ignored by Sequelize if not in model, or mapped to timestamp?
        };

        // Check if Validator 3 exists
        const val = await Validator.findByPk(3);
        console.log('Validator 3 exists:', !!val);

        const step = await ApprovalStep.create(data);
        console.log('✅ Created:', step.toJSON());

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

reproduce();
