const { Model, DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

/**
 * Category Schema
 * @private
 */
class Category extends Model {}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: 'categories',
    indexes: [{ fields: ['id'] }],
  }
);

/**
 * @typedef Category
 */
module.exports = Category;
