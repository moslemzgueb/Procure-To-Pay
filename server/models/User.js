const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true, // Allow null for existing users, but ideally required
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('initiator', 'approver', 'finance_admin', 'stakeholder', 'system_admin', 'admin'),
        defaultValue: 'initiator'
    }
});

module.exports = User;
