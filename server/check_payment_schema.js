const { sequelize } = require('./models');

async function checkSchema() {
    try {
        const [results] = await sequelize.query("PRAGMA table_info(PaymentRequests);");
        console.log('PaymentRequests table schema:');
        results.forEach(col => {
            console.log(`- ${col.name}: ${col.type}, notnull=${col.notnull}, default=${col.dflt_value}`);
        });

        // Also check foreign keys
        const [fks] = await sequelize.query("PRAGMA foreign_key_list(PaymentRequests);");
        console.log('\nForeign Keys:');
        fks.forEach(fk => {
            console.log(`- ${fk.from} -> ${fk.table}.${fk.to}`);
        });

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await sequelize.close();
    }
}

checkSchema();
