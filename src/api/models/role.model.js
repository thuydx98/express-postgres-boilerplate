const { Model, DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const { CacheService } = require('../services');
const CacheKeys = require('../constants/cache.const');
const Permission = require('./permission.model');
const User = require('./user.model');

const ttl = 60 * 60 * 10; // cache for 10 Hour
const cache = new CacheService(ttl);

class Role extends Model {
  static getCachedList = async () =>
    await cache.get(CacheKeys.ROLE_LIST, () =>
      this.findAll({
        include: [{ model: Permission }],
      })
    );
}

Role.init(
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    isRoot: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    timestamps: true,
    modelName: 'roles',
    indexes: [{ fields: ['id'] }],
  }
);

Permission.role = Permission.belongsTo(Role);
Role.permissions = Role.hasMany(Permission);

User.role = User.belongsTo(Role);
Role.users = Role.hasMany(User);

module.exports = Role;
