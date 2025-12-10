const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PaymentRequest = sequelize.define('PaymentRequest', {
    linked_budget_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    entity_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    initiator_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    vendor_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    product_service_description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    invoice_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    invoice_number: {
        type: DataTypes.STRING,
        allowNull: false
    },
    period_start: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    period_end: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    currency: {
        type: DataTypes.STRING,
        allowNull: false
    },
    amount_local: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    amount_reporting: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'),
        defaultValue: 'DRAFT'
    },
    current_approval_step: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
    },
    approval_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    last_modified: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

module.exports = PaymentRequest;
