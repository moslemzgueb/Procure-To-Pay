const fs = require('fs');
const path = require('path');
const {
    sequelize, User, Entity, Vendor, Validator, ApprovalRule, ApprovalStep,
    Budget, PaymentRequest, Requisition, PurchaseOrder, QAThread, Attachment,
    NotificationSettings, SystemSetting
} = require('../models');

const DATA_FILE = path.join(__dirname, 'data', 'initial_data.json');

async function exportData() {
    try {
        console.log('Exporting data...');
        const data = {};

        data.users = await User.findAll();
        data.entities = await Entity.findAll();
        data.vendors = await Vendor.findAll();
        data.validators = await Validator.findAll();
        data.approvalRules = await ApprovalRule.findAll();
        data.approvalSteps = await ApprovalStep.findAll();
        data.budgets = await Budget.findAll();
        data.paymentRequests = await PaymentRequest.findAll();
        data.requisitions = await Requisition.findAll();
        data.purchaseOrders = await PurchaseOrder.findAll();
        data.qaThreads = await QAThread.findAll();
        data.attachments = await Attachment.findAll();
        data.notificationSettings = await NotificationSettings.findAll();
        data.systemSettings = await SystemSetting.findAll();

        const dataDir = path.dirname(DATA_FILE);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        console.log(`Data exported to ${DATA_FILE}`);
    } catch (error) {
        console.error('Export failed:', error);
    } finally {
        await sequelize.close();
    }
}

exportData();
