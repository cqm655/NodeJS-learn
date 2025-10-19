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
    email: {
        type: Sequelize.STRING,
        unique: true,

    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
})

module.exports = User
