const { sequelize } = require('./models');

async function fixVendorIdConstraint() {
    try {
        console.log('Fixing vendor_id constraint in PaymentRequests table...');

        // SQLite doesn't support ALTER COLUMN directly, so we need to:
        // 1. Create a new table with correct schema
        // 2. Copy data
        // 3. Drop old table
        // 4. Rename new table

        await sequelize.query(`
            CREATE TABLE PaymentRequests_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                linked_budget_id INTEGER,
                entity_id INTEGER NOT NULL,
                initiator_id INTEGER NOT NULL,
                vendor_id INTEGER,  -- Changed to allow NULL
                product_service_description TEXT NOT NULL,
                invoice_date TEXT NOT NULL,
                invoice_number TEXT NOT NULL,
                period_start TEXT,
                period_end TEXT,
                currency TEXT NOT NULL,
                amount_local DECIMAL(15,2) NOT NULL,
                amount_reporting DECIMAL(15,2),
                status TEXT DEFAULT 'DRAFT',
                current_approval_step INTEGER,
                approval_date DATETIME,
                last_modified DATETIME DEFAULT CURRENT_TIMESTAMP,
                createdAt DATETIME NOT NULL,
                updatedAt DATETIME NOT NULL
            );
        `);

        console.log('New table created');

        // Copy existing data
        await sequelize.query(`
            INSERT INTO PaymentRequests_new 
            SELECT * FROM PaymentRequests;
        `);

        console.log('Data copied');

        // Drop old table
        await sequelize.query(`DROP TABLE PaymentRequests;`);
        console.log('Old table dropped');

        // Rename new table
        await sequelize.query(`ALTER TABLE PaymentRequests_new RENAME TO PaymentRequests;`);
        console.log('Table renamed');

        console.log('✓ SUCCESS! vendor_id can now be NULL');

    } catch (error) {
        console.error('ERROR:', error.message);
        if (error.original) console.error('SQL Error:', error.original);
    } finally {
        await sequelize.close();
    }
}

fixVendorIdConstraint();
