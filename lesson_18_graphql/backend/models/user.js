const sequelize = require('../utils/database')
const {DataTypes} = require("sequelize");

const User = sequelize.define('user', {
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
