const { Model, DataTypes, Deferrable } = require('sequelize');
const sequelize = require('../../config/database');
const crypto = require('crypto');
const moment = require('moment-timezone');
const User = require('./user.model');

/**
 * Refresh Token Schema
 * @private
 */
class PasswordResetToken extends Model {
  /**
   * Generate a reset token object and saves it into the database
   *
   * @param {User} user
   * @returns {ResetToken}
   */
  static async generate(user) {
    const userId = user.id;
    const userEmail = user.email;
    const resetToken = `${userId}.${crypto.randomBytes(40).toString('hex')}`;
    const expires = moment().add(2, 'hours').toDate();
    const ResetTokenObject = new PasswordResetToken({
      resetToken,
      userId,
      userEmail,
      expires,
    });
    await ResetTokenObject.save();
    return ResetTokenObject;
  }
}

PasswordResetToken.init(
  {
    resetToken: {
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
    modelName: 'passwordResetTokens',
    indexes: [{ unique: true, fields: ['resetToken'] }],
  }
);

/**
 * @typedef PasswordResetToken
 */
module.exports = PasswordResetToken;
