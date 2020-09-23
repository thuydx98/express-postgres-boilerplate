const Joi = require('joi');

module.exports = {
  // GET /v1/blogs
  listBlogs: {
    query: {
      pageIndex: Joi.number().min(1),
      pageSize: Joi.number().min(1),
      searchKey: Joi.string().max(128),
      sortBy: Joi.string().max(50),
      sortType: Joi.string().valid(['ASC', 'DESC', 'asc', 'desc']),
      categoryIds: Joi.alternatives().try(
        Joi.array().items(Joi.number()),
        Joi.number()
      ),
      tagIds: Joi.alternatives().try(
        Joi.array().items(Joi.number()),
        Joi.number()
      ),
    },
  },
};
