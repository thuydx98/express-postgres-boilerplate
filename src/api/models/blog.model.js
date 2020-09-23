const { Model, DataTypes, Deferrable, Op } = require('sequelize');
const sequelize = require('../../config/database');
const Tag = require('./tag.model');
const User = require('./user.model');
const Category = require('./category.model');
const { omitBy, isNil } = require('lodash');

/**
 * Blog Schema
 * @private
 */
class Blog extends Model {
  /**
   * List blogs.
   *
   * @param {number} pageIndex      - Number of page.
   * @param {number} pageSize       - Limit number of users to be returned.
   * @param {string} searchKey      - Filter search result by user's name.
   * @param {string} sortBy         - Filter search result by user's email.
   * @param {string} sortType       - Sort result by DESC || ASC.
   * @param {string[]} categoryIds  - Filter search result by list category id.
   * @param {string[]} tagIds         - Filter search result by list tag id.
   * @returns {Promise<User[]>}
   */
  static async list({
    pageIndex = 1,
    pageSize = 10,
    searchKey,
    sortBy = 'createdAt',
    sortType = 'DESC',
    categoryIds,
    tagIds,
  }) {
    searchKey = searchKey ? { [Op.like]: `%${searchKey}%` } : null;
    categoryIds = typeof categoryIds === 'number' ? [categoryIds] : categoryIds;
    tagIds = typeof tagIds === 'number' ? [tagIds] : tagIds;

    const options = searchKey
      ? { [Op.or]: [{ title: searchKey }, { content: searchKey }] }
      : null;

    const blogs = await this.findAndCountAll({
      include: [
        {
          model: Category,
          attributes: ['id', 'title'],
          where: categoryIds ? { id: { [Op.in]: categoryIds } } : null,
          through: { attributes: [] },
        },
        {
          model: Tag,
          attributes: ['id', 'title'],
          where: tagIds ? { id: { [Op.in]: tagIds } } : null,
          through: { attributes: [] },
        },
      ],
      where: options,
      order: [[sortBy, sortType]],
      offset: pageSize * (pageIndex - 1),
      limit: pageSize,
    });

    return { ...blogs, pageSize, pageIndex };
  }
}

Blog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
    url: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    timestamps: true,
    modelName: 'blogs',
    indexes: [{ fields: ['title'] }],
  }
);

Blog.categories = Blog.belongsToMany(Category, { through: 'blogCategory' });
Category.blogs = Category.belongsToMany(Blog, { through: 'blogCategory' });

Blog.tags = Blog.belongsToMany(Tag, { through: 'blogTag' });
Tag.blogs = Tag.belongsToMany(Blog, { through: 'blogTag' });

User.blogs = User.hasMany(Blog);
Blog.user = Blog.belongsTo(User);

/**
 * @typedef Blog
 */
module.exports = Blog;
