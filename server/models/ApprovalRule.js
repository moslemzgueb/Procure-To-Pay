const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ApprovalRule = sequelize.define('ApprovalRule', {
    entity_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    workflow_type: {
        type: DataTypes.ENUM('BUDGET', 'PAYMENT', 'NON_BUDGETED_PAYMENT'),
        allowNull: false
    },
    group_number: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    approvers: {
        type: DataTypes.JSON, // List of User IDs or Roles
        allowNull: false
    },
    logic: {
        type: DataTypes.STRING, // 'OR'
        defaultValue: 'OR'
    }
});

module.exports = ApprovalRule;
