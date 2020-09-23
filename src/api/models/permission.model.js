const { Model, DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const Role = require('./role.model');

class Permission extends Model {}

Permission.init(
  {
    id: {
      type: DataTypes.STRING(100),
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    roleId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      references: {
        model: Role,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    timestamps: true,
    modelName: 'permissions',
    indexes: [{ fields: ['id'] }],
  }
);

module.exports = Permission;
