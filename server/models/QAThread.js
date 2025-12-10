const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QAThread = sequelize.define('QAThread', {
    object_type: {
        type: DataTypes.ENUM('BUDGET', 'PAYMENT'),
        allowNull: false
    },
    object_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    author_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

module.exports = QAThread;
