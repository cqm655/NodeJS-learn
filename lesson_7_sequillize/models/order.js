const Sequelize = require('sequelize');

const sequelize = require('../util/database');
const {DataTypes} = require("sequelize");

const Order = sequelize.define('order', {
    id: {
        type: DataTypes.STRING,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
})

module.exports = Order;
