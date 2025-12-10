const { sequelize } = require('../models');

async function checkConstraints() {
    try {
        const [results] = await sequelize.query("PRAGMA foreign_key_list(ApprovalSteps);");
        console.log('--- ApprovalSteps Foreign Keys ---');
        results.forEach(fk => {
            console.log(`ID: ${fk.id}, Seq: ${fk.seq}, Table: ${fk.table}, From: ${fk.from}, To: ${fk.to}`);
        });
    } catch (error) {
        console.error('Error checking constraints:', error);
    } finally {
        await sequelize.close();
    }
}

checkConstraints();
