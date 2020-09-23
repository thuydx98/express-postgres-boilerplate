const Roles = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  LOGGED_USER: '_loggedUser',
};

module.exports.Roles = Roles;
module.exports.RoleList = [
  {
    id: Roles.ADMIN,
    title: 'Admin System',
    isRoot: true,
  },
  {
    id: Roles.USER,
    title: 'User',
    isRoot: true,
  },
];
