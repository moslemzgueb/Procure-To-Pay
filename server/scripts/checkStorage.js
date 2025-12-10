const { sequelize } = require('../models');

sequelize.options.logging = false;

async function checkApproversStorage() {
    try {
        const [results] = await sequelize.query("SELECT id, entity_id, group_number, approvers, typeof(approvers) as type FROM ApprovalRules;");

        console.log('=== APPROVAL RULES STORAGE ===\n');

        for (const row of results) {
            console.log(`Rule ID: ${row.id}`);
            console.log(`  Entity: ${row.entity_id}, Group: ${row.group_number}`);
            console.log(`  Approvers value: ${row.approvers}`);
            console.log(`  Type: ${row.type}`);
            console.log(`  Parsed: ${JSON.stringify(JSON.parse(row.approvers))}`);
            console.log('');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkApproversStorage();
