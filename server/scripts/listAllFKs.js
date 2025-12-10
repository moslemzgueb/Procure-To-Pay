const { sequelize } = require('../models');

async function listAllFKs() {
    try {
        const [fks] = await sequelize.query("PRAGMA foreign_key_list(ApprovalSteps);");
        console.log('Total FKs found:', fks.length);
        fks.forEach((fk, index) => {
            console.log(`FK #${index}: From ${fk.from} -> To ${fk.table}.${fk.to}`);
        });
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

listAllFKs();
