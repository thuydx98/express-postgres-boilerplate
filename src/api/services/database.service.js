const { User, Role } = require('../models');
const sequelize = require('../../config/database');
const { Roles, RoleList } = require('../constants');
const vars = require('../../config/vars');

/**
 * Creates the table if it doesn't exist (and does nothing if it already exists)
 * @public
 */
module.exports.sync = async () => {
  await sequelize.sync();
};

/**
 * Checks what is the current state of the table in the database
 * (which columns it has, what are their data types, etc),
 * and then performs the necessary changes in the table to make it match the model.
 * @public
 */
module.exports.alterSync = async () => {
  await sequelize.sync({ alter: true });
};

/**
 * Creates the table, dropping it first if it already existed
 * @public
 */
module.exports.forceSync = async () => {
  await sequelize.sync({ force: true });
};
