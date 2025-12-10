const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attachment = sequelize.define('Attachment', {
    object_type: {
        type: DataTypes.ENUM('BUDGET', 'PAYMENT'),
        allowNull: false
    },
    object_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    file_path: {
        type: DataTypes.STRING,
        allowNull: false
    },
    upload_timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

module.exports = Attachment;
