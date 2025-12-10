const fs = require('fs');
const path = require('path');
const {
    sequelize, User, Entity, Vendor, Validator, ApprovalRule, ApprovalStep,
    Budget, PaymentRequest, Requisition, PurchaseOrder, QAThread, Attachment,
    NotificationSettings, SystemSetting
} = require('../models');

const DATA_FILE = path.join(__dirname, 'data', 'initial_data.json');

async function importData() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            console.log('No data file found. Skipping import.');
            return;
        }

        console.log('Importing data...');
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

        // Sync DB first (ensure tables exist)
        // Note: index.js usually does this, but we might run this standalone
        await sequelize.sync();

        // Helper to import
        const importModel = async (Model, dataList) => {
            if (!dataList || dataList.length === 0) return;
            // Use simple create loop to handle associations implicitly by ID existence
            // bulkCreate is faster but can be tricky with some sqlite versions / auto-increment
            // For small datasets, loop is fine.
            for (const item of dataList) {
                const exists = await Model.findByPk(item.id);
                if (!exists) {
                    await Model.create(item);
                } else {
                    await exists.update(item);
                }
            }
            console.log(`Imported ${dataList.length} ${Model.name}s`);
        };

        // Order matters!
        await importModel(User, data.users);
        await importModel(Entity, data.entities);
        await importModel(Vendor, data.vendors);
        await importModel(Validator, data.validators);
        await importModel(ApprovalRule, data.approvalRules);
        await importModel(ApprovalStep, data.approvalSteps);
        await importModel(Budget, data.budgets);
        await importModel(PaymentRequest, data.paymentRequests);
        await importModel(Requisition, data.requisitions);
        await importModel(PurchaseOrder, data.purchaseOrders);
        await importModel(QAThread, data.qaThreads);
        await importModel(Attachment, data.attachments);
        await importModel(NotificationSettings, data.notificationSettings);
        await importModel(SystemSetting, data.systemSettings);

        console.log('Data import complete.');
    } catch (error) {
        console.error('Import failed:', error);
    } finally {
        await sequelize.close();
    }
}

importData();
