const sequelize = require('../utils/database')

const {DataTypes, STRING} = require('sequelize');

const Post = sequelize.define('post', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.STRING,
        allowNull: false
    },
    creator: {
        type: DataTypes.JSON,
        allowNull: true
    },

}, {timestamps: true})

module.exports = Post;