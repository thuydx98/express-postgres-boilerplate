const { Model, DataTypes, Deferrable } = require('sequelize');
const sequelize = require('../../config/database');
const Blog = require('./blog.model');

/**
 * Blog Schema
 * @private
 */
class Tag extends Model {}

Tag.init(
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
    modelName: 'tags',
    indexes: [{ fields: ['title'] }],
  }
);

/**
 * @typedef Tag
 */
module.exports = Tag;
