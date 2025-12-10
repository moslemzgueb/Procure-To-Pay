const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Budget = sequelize.define('Budget', {
    entity_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    initiator_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    expense_category: {
        type: DataTypes.STRING,
        allowNull: true
    },
    expense_type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    nature: {
        type: DataTypes.STRING, // e.g., operating, deal cost
        allowNull: true
    },
    budget_source: {
        type: DataTypes.STRING, // e.g., fund budget, management company budget
        allowNull: true
    },
    one_time_or_recurring: {
        type: DataTypes.ENUM('ONE_TIME', 'RECURRING'),
        allowNull: true
    },
    frequency: {
        type: DataTypes.STRING, // e.g., monthly, quarterly, annual
        allowNull: true
    },
    product_service_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    deal_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    vendor_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    country: {
        type: DataTypes.STRING,
        allowNull: true
    },
    currency: {
        type: DataTypes.STRING,
        allowNull: true
    },
    total_budget_local: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true
    },
    total_budget_reporting: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CLOSED'),
        defaultValue: 'DRAFT'
    },
    current_approval_step: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    approval_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    last_modified: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    // Keeping legacy fields for now to avoid immediate breakage, but they should be migrated
    amountLCY: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true
    },
    type: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Budget;
