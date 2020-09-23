const Sequelize = require('sequelize');
const { database } = require('./vars');

module.exports = new Sequelize(database.uri);
