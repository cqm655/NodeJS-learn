const Sequelize = require('sequelize');

const sequelize = require('../util/database');
const {DataTypes} = require("sequelize");

const CartItem = sequelize.define('cartItem', {
    id: {
        type: DataTypes.STRING,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    quantity: Sequelize.INTEGER,
})

module.exports = CartItem;
