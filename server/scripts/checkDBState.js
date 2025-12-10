const { sequelize } = require('../models');

async function checkDBState() {
    try {
        console.log('=== CHECKING DB STATE ===\n');

        // 1. Check Validators
        const [validators] = await sequelize.query("SELECT * FROM Validators WHERE id = 3;");
        console.log('Validator ID 3:', validators.length > 0 ? validators[0] : 'NOT FOUND');

        // 2. Check ApprovalSteps Schema
        const [columns] = await sequelize.query("PRAGMA table_info(ApprovalSteps);");
        console.log('\nApprovalSteps Columns:');
        columns.forEach(c => console.log(`- ${c.name} (${c.type})`));

        // 3. Check FKs
        const [fks] = await sequelize.query("PRAGMA foreign_key_list(ApprovalSteps);");
        console.log('\nApprovalSteps Foreign Keys:');
        fks.forEach(fk => {
            console.log(`- From: ${fk.from}, To: ${fk.table}.${fk.to}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkDBState();
