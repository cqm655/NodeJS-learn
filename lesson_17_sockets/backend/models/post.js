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
    }

}, {timestamps: true})

module.exports = Post;