const Sequelize = require("sequelize"); //import a class

const sequelize = require("../util/database");
const {DataTypes} = require("sequelize");

const Product = sequelize.define("product", {
    id: {
        type: DataTypes.STRING,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    price: {
        type: Sequelize.DOUBLE,
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    imageUrl: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false,
    }
})

module.exports = Product;

