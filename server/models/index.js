const sequelize = require('../config/database');
const User = require('./User');
const Requisition = require('./Requisition');
const PurchaseOrder = require('./PurchaseOrder');
const Budget = require('./Budget');
const Validator = require('./Validator');
const Entity = require('./Entity');
const Vendor = require('./Vendor');

const PaymentRequest = require('./PaymentRequest');
const ApprovalRule = require('./ApprovalRule');
const ApprovalStep = require('./ApprovalStep');
const QAThread = require('./QAThread');
const Attachment = require('./Attachment');
const NotificationSettings = require('./NotificationSettings');
const SystemSetting = require('./SystemSetting');

// Associations

// Budget Associations
Budget.belongsTo(Entity, { foreignKey: 'entity_id' });
Budget.belongsTo(User, { as: 'Initiator', foreignKey: 'initiator_id' });
Budget.belongsTo(Vendor, { foreignKey: 'vendor_id' });

// PaymentRequest Associations
PaymentRequest.belongsTo(Budget, { foreignKey: 'linked_budget_id' });
PaymentRequest.belongsTo(Entity, { foreignKey: 'entity_id' });
PaymentRequest.belongsTo(User, { as: 'Initiator', foreignKey: 'initiator_id' });
PaymentRequest.belongsTo(Vendor, { foreignKey: 'vendor_id' });

// Attachment Associations
Attachment.belongsTo(PaymentRequest, { foreignKey: 'object_id', constraints: false, scope: { object_type: 'PAYMENT' } });
Attachment.belongsTo(Budget, { foreignKey: 'object_id', constraints: false, scope: { object_type: 'BUDGET' } });
PaymentRequest.hasMany(Attachment, { foreignKey: 'object_id', constraints: false, scope: { object_type: 'PAYMENT' } });
Budget.hasMany(Attachment, { foreignKey: 'object_id', constraints: false, scope: { object_type: 'BUDGET' } });


// Approval Associations
ApprovalRule.belongsTo(Entity, { foreignKey: 'entity_id' });
ApprovalRule.hasMany(ApprovalStep, { foreignKey: 'approval_rule_id' });
ApprovalStep.belongsTo(ApprovalRule, { foreignKey: 'approval_rule_id' });
ApprovalStep.belongsTo(Validator, { as: 'Approver', foreignKey: 'approver_id' });

// QAThread Associations
QAThread.belongsTo(User, { as: 'Author', foreignKey: 'author_id' });

// User-Validator Association
User.hasOne(Validator, { foreignKey: 'user_id' });
Validator.belongsTo(User, { foreignKey: 'user_id' });

// Legacy Associations (keeping for now)
User.hasMany(Requisition, { foreignKey: 'userId' });
Requisition.belongsTo(User, { foreignKey: 'userId' });
Requisition.hasOne(PurchaseOrder, { foreignKey: 'requisitionId' });
PurchaseOrder.belongsTo(Requisition, { foreignKey: 'requisitionId' });
Requisition.belongsTo(Budget, { foreignKey: 'budgetId' });
Budget.hasMany(Requisition, { foreignKey: 'budgetId' });

module.exports = {
    sequelize,
    User,
    Requisition,
    PurchaseOrder,
    Budget,
    Validator,
    Entity,
    Vendor,
    PaymentRequest,
    ApprovalRule,
    ApprovalStep,
    QAThread,
    Attachment,
    NotificationSettings,
    SystemSetting
};
