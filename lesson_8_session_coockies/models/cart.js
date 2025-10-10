const Sequelize = require('sequelize');

const sequelize = require('../util/database');
const {DataTypes} = require("sequelize");

const Cart = sequelize.define('cart', {
    id: {
        type: DataTypes.STRING,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    }
})

module.exports = Cart;
