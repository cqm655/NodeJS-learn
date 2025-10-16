const Sequelize = require('sequelize');
const sequelize = require('../util/database')
const {DataTypes} = require("sequelize");

const User = sequelize.define('User', {
    id: {
        type: DataTypes.STRING,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    name: Sequelize.STRING,
    email: Sequelize.STRING,
    password: {
        type: DataTypes.STRING,
        required: true,
    },
})

module.exports = User
