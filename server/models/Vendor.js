const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vendor = sequelize.define('Vendor', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    country: {
        type: DataTypes.STRING,
        allowNull: false
    },
    default_currency: {
        type: DataTypes.STRING,
        allowNull: false
    },
    contact_info: {
        type: DataTypes.STRING,
        allowNull: true
    },
    default_entity_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
});

module.exports = Vendor;
