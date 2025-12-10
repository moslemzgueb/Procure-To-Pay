const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Validator = sequelize.define('Validator', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    department: {
        type: DataTypes.STRING,
        allowNull: true
    },
    level: {
        type: DataTypes.ENUM('Level 1', 'Level 2', 'Senior'),
        defaultValue: 'Level 1'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true // Can be null if not yet linked, but ideally should be linked
    }
});

module.exports = Validator;
