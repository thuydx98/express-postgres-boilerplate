const { Model, DataTypes, Deferrable } = require('sequelize');
const sequelize = require('../../config/database');
const crypto = require('crypto');
const moment = require('moment-timezone');
const User = require('./user.model');

/**
 * Refresh Token Schema
 * @private
 */
class RefreshToken extends Model {
  /**
   * Generate a refresh token object and saves it into the database
   *
   * @param {User} user
   * @returns {RefreshToken}
   */
  static generate(user) {
    const userId = user.id;
    const userEmail = user.email;
    const token = `${userId}.${crypto.randomBytes(40).toString('hex')}`;
    const expires = moment().add(30, 'days').toDate();
    const tokenObject = new RefreshToken({
      token,
      userId,
      userEmail,
      expires,
    });
    tokenObject.save();
    return tokenObject;
  }
}

RefreshToken.init(
  {
    token: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
        deferrable: Deferrable.INITIALLY_IMMEDIATE,
      },
    },
    userEmail: {
      type: DataTypes.STRING(200),
      allowNull: false,
      references: {
        model: User,
        key: 'email',
        deferrable: Deferrable.INITIALLY_IMMEDIATE,
      },
    },
    expires: { type: DataTypes.DATE },
  },
  {
    sequelize,
    timestamps: true,
    modelName: 'refreshTokens',
    indexes: [{ unique: true, fields: ['token'] }],
  }
);

/**
 * @typedef RefreshToken
 */
module.exports = RefreshToken;
