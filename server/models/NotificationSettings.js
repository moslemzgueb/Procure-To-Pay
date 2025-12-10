const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NotificationSettings = sequelize.define('NotificationSettings', {
    entity_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    workflow_type: {
        type: DataTypes.ENUM('BUDGET', 'PAYMENT'),
        allowNull: false
    },
    users_to_notify: {
        type: DataTypes.JSON, // List of User IDs
        allowNull: false
    }
});

module.exports = NotificationSettings;
