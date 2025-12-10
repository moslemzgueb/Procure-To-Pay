const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ApprovalStep = sequelize.define('ApprovalStep', {
    object_type: {
        type: DataTypes.ENUM('BUDGET', 'PAYMENT'),
        allowNull: false
    },
    object_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    approver_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    decision: {
        type: DataTypes.ENUM('APPROVED', 'REJECTED', 'INFO_REQUESTED'),
        allowNull: false
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

module.exports = ApprovalStep;
