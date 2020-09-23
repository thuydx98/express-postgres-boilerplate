const { Blog } = require('../models');

/**
 * Get blog list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const blogs = await Blog.list(req.query);
    res.json(blogs);
  } catch (error) {
    next(error);
  }
};
