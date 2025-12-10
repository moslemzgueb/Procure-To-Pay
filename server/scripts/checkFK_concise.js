const { sequelize } = require('../models');

async function checkFK() {
    try {
        const [fks] = await sequelize.query("PRAGMA foreign_key_list(ApprovalSteps);");
        console.log('FKs:');
        fks.forEach(fk => console.log(`${fk.from} -> ${fk.table}.${fk.to}`));
    } catch (error) {
        console.error(error);
    } finally {
        await sequelize.close();
    }
}

checkFK();
