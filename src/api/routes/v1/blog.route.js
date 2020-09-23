const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/blog.controller');
const { listBlogs } = require('../../validations/blog.validation');

const router = express.Router();

router
  .route('/')
  /**
   * @api {get} v1/blogs List Blogs
   * @apiDescription Get a list of blogs
   * @apiVersion 1.0.0
   * @apiName ListUsers
   * @apiGroup Blog
   * @apiPermission public
   *
   * @apiParam  {Number{1-}}                    [pageIndex=1]       Number of page
   * @apiParam  {Number{1-100}}                 [pageSize=10]       Blogs per page
   * @apiParam  {String}                        [searchKey]         Search key by title or content
   * @apiParam  {String}                        [sortBy=createdAt]  Sort by the name of Blog Table's column
   * @apiParam  {String=ASC,DESC,asc,desc}      [sortType=DESC]     Sort with increment or descending
   * @apiParam  {Number|Number[]{1-}}           [categoryIds]       Filter by categoryId or list categoryId
   * @apiParam  {Number|Number[]{1-}}           [tagIds]            Filter by tagId or list tagId
   *
   * @apiSuccess {Object[]} blogs List of blogs.
   *
   * @apiError (Internal Server Error 500)  InternalServerError  The server have some thing wrong
   */
  .get(validate(listBlogs), controller.list);

module.exports = router;
