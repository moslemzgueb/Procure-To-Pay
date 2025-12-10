const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Requisition = sequelize.define('Requisition', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    budgetId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Budgets',
            key: 'id'
        }
    },
    invoiceAttachment: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
    }
});

module.exports = Requisition;
