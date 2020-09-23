const express = require('express');
const controller = require('../../controllers/system.controller');

const router = express.Router();

router
  .route('/migrate-database')
  /**
   * @api {post} v1/system/migrate-database Migrate Database
   * @apiDescription Sync database with modals (code first)
   * @apiVersion 1.0.0
   * @apiName MigrateDatabase
   * @apiGroup System
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam  {String}    type  Sync database options (alter || force || null)
   *
   * @apiSuccess {Object} success
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admins can access the data
   */
  .post(controller.migrate);

module.exports = router;
