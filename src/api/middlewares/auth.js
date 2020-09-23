const httpStatus = require('http-status');
const passport = require('passport');
const { Roles } = require('../constants');
const Role = require('../models/role.model');
const APIError = require('../utils/APIError');

const handleJWT = (req, res, next, permissions) => async (err, user, info) => {
  const error = err || info;
  const logIn = Promise.promisify(req.logIn);
  const apiError = new APIError({
    message: error ? error.message : 'Unauthorized',
    status: httpStatus.UNAUTHORIZED,
    stack: error ? error.stack : undefined,
  });

  try {
    if (error || !user) throw error;
    await logIn(user, { session: false });
  } catch (e) {
    return next(apiError);
  }

  if (err || !user) {
    return next(apiError);
  }

  req.user = user;
  if (user.roleId === Roles.ADMIN) {
    return next();
  }

  const cachedRoles = await Role.getCachedList();
  if (permissions) {
    if (permissions === Roles.LOGGED_USER) {
      if (
        user.roleId == Roles.ADMIN ||
        req.params.userId !== user.id.toString()
      ) {
        return next();
      }
    }

    permissions = typeof permissions === 'string' ? [permissions] : permissions;
    if (permissions.includes(user.roleId)) {
      return next();
    }

    const userRole = cachedRoles.find((item) => item.id === user.roleId);
    if (userRole) {
      const allow = userRole.permissions.some((p) =>
        permissions.includes(p.id)
      );
      if (allow) {
        return next();
      }
    }
  } else {
    if (cachedRoles.map((item) => item.id).includes(user.roleId)) {
      return next();
    }
  }

  return !user
    ? next(apiError)
    : next(
        new APIError({
          message: 'Forbidden',
          status: httpStatus.FORBIDDEN,
        })
      );
};

exports.authorize = (permissions) => (req, res, next) =>
  passport.authenticate(
    'jwt',
    { session: false },
    handleJWT(req, res, next, permissions)
  )(req, res, next);

exports.oAuth = (service) => passport.authenticate(service, { session: false });
