const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const moment = require('moment-timezone');
const jwt = require('jwt-simple');
const { jwtSecret, jwtExpirationInterval } = require('../../config/vars');

const { Model, DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const { APIError } = require('../utils');
const { Roles } = require('../constants');
const { Role, Blog } = require('.');

/**
 * User Schema
 * @private
 */
class User extends Model {
  transform() {
    const transformed = {};
    const fields = ['id', 'name', 'email', 'picture', 'roleId', 'createdAt'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  }

  token() {
    const payload = {
      exp: moment().add(jwtExpirationInterval, 'minutes').unix(),
      iat: moment().unix(),
      sub: this.id,
    };
    return jwt.encode(payload, jwtSecret);
  }

  async passwordMatches(password) {
    return bcrypt.compare(password, this.password);
  }

  async updatePassword(password) {
    this.password = await hashPassword(password);
    this.save();
  }

  /**
   * Get user by id
   *
   * @param {ObjectId} id
   * @returns {Promise<User, APIError>}
   */
  static async get(id) {
    try {
      const user = await this.findByPk(id);
      if (user) {
        return user;
      }

      throw new APIError({
        message: 'User does not exist',
        status: httpStatus.NOT_FOUND,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find user by email and tries to generate a JWT token
   *
   * @param {Object} options
   * @returns {Promise<User, APIError>}
   */
  static async findAndGenerateToken(options) {
    const { email, password, refreshObject } = options;
    if (!email) {
      throw new APIError({
        message: 'An email is required to generate a token',
      });
    }

    const user = await this.findOne({ where: { email } });
    const err = {
      status: httpStatus.UNAUTHORIZED,
      isPublic: true,
    };

    if (password) {
      if (user && (await user.passwordMatches(password))) {
        return { user, accessToken: user.token() };
      }
      err.message = 'Incorrect email or password';
    } else if (refreshObject && refreshObject.userEmail === email) {
      if (moment(refreshObject.expires).isBefore()) {
        err.message = 'Invalid refresh token.';
      } else {
        return { user, accessToken: user.token() };
      }
    } else {
      err.message = 'Incorrect email or refreshToken';
    }

    throw new APIError(err);
  }

  /**
   * List users in descending order of 'name'.
   *
   * @param {number} pageIndex    - Number of page.
   * @param {number} pageSize     - Limit number of users to be returned.
   * @param {string} name         - Filter search result by user's name.
   * @param {string} email        - Filter search result by user's email.
   * @param {string} role         - Filter search result by user's role.
   * @returns {Promise<User[]>}
   */
  static async list({ pageIndex = 1, pageSize = 30, name, email, role }) {
    const options = omitBy({ name, email, role }, isNil);
    const users = await this.findAndCountAll({
      where: options,
      order: [['name', 'DESC']],
      offset: pageSize * (pageIndex - 1),
      limit: pageSize,
    });

    return { ...users, pageSize, pageIndex };
  }

  /**
   * Return new validation error
   * if error is a mongoose duplicate key error
   *
   * @param {Error} error
   * @returns {Error|APIError}
   */
  static checkDuplicateEmail(error) {
    if (
      error.name === 'SequelizeUniqueConstraintError' &&
      error.original.code === '23505'
    ) {
      return new APIError({
        message: 'Validation Error',
        errors: [
          {
            field: 'email',
            location: 'body',
            messages: ['"email" already exists'],
          },
        ],
        status: httpStatus.CONFLICT,
        isPublic: true,
        stack: error.stack,
      });
    }
    return error;
  }

  /**
   * Create/Update user using OAuth (facebook/google)
   *
   * @param {Object} OAuthUser
   * @returns {Promise<User}
   */
  static async oAuthLogin({ service, id, email, name, picture }) {
    const user = await this.findOne({
      where: {
        $or: [{ [service]: id }, { email }],
      },
    });

    if (user) {
      user[service] = id;
      if (!user.name) user.name = name;
      if (!user.picture) user.picture = picture;
      return user.save();
    }

    return this.create({
      [service]: id,
      email,
      name,
      picture,
    });
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(200),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(200),
    },
    name: {
      type: DataTypes.STRING(200),
    },
    facebook: {
      type: DataTypes.STRING(200),
    },
    google: {
      type: DataTypes.STRING(200),
    },
    picture: {
      type: DataTypes.TEXT,
    },
    roleId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Roles.USER,
      references: {
        model: Role,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    timestamps: true,
    modelName: 'users',
    indexes: [{ unique: true, fields: ['email'] }],
  }
);

User.beforeCreate(async (user) => {
  user.password = await hashPassword(user.password);
});

const hashPassword = async (password) => {
  const salt = bcrypt.genSaltSync(10);
  return await bcrypt.hash(password, salt);
};

module.exports = User;
