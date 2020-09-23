const vars = require('../../config/vars');
const { Roles, RoleList } = require('../constants');
const { Role, User, Permission } = require('../models');
const { databaseService } = require('../services');

exports.migrate = async (req, res, next) => {
  // var aaa = await Permission.findAll({
  //   include: [{ model: Role }],
  // });

  // return res.json(aaa);

  try {
    let result = null;
    switch (req.body.type) {
      case 'alter':
        await databaseService.alterSync();
        break;
      case 'force':
        await databaseService.forceSync();
        result = await createRootData();
        break;

      default:
        await databaseService.sync();
        break;
    }

    return res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const createRootData = async () => {
  const roles = [];
  for (const role of RoleList) {
    const insertedRole = await Role.create(role);
    roles.push(insertedRole);
  }

  const rootUser = await User.create({
    email: vars.rootUser.email,
    password: vars.rootUser.password,
    roleId: Roles.ADMIN,
  });

  const permission = await Permission.create({
    id: 'CHANGE_PASSWORD',
    title: 'Change password',
    roleId: Roles.USER,
  });

  return { roles, rootUser: rootUser.transform(), permission };
};
