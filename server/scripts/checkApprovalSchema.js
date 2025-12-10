const { sequelize } = require('../models');

async function checkSchema() {
    try {
        const [results, metadata] = await sequelize.query("PRAGMA table_info(ApprovalSteps);");
        console.log('--- ApprovalSteps Table Columns ---');
        results.forEach(col => {
            console.log(`${col.cid}: ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''}`);
        });
    } catch (error) {
        console.error('Error checking schema:', error);
    } finally {
        await sequelize.close();
    }
}

checkSchema();
