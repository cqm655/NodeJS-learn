const sequelize = require('../utils/database')
const {Sequelize, DataTypes} = require("sequelize");
const Post = require('./post');

const User = sequelize.define('user_rest_api', {
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'New'
    }
})

module.exports = User;