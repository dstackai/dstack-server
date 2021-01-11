var routes = {
  notFound: function notFound() {
    return '/404';
  },
  auth: function auth() {
    return '/auth';
  },
  authLogin: function authLogin() {
    return '/auth/login';
  },
  verifyUser: function verifyUser() {
    return '/auth/verify';
  },
  authSignUp: function authSignUp() {
    return '/auth/signup';
  },
  authForgetPassword: function authForgetPassword() {
    return '/auth/forget-password';
  },
  authResetPassword: function authResetPassword() {
    return '/auth/reset-password';
  },
  confirmEmailMessage: function confirmEmailMessage() {
    return '/auth/confirm-message';
  },
  stacks: function stacks() {
    return '/';
  },
  userStacks: function userStacks(user) {
    if (user === void 0) {
      user = ':user';
    }

    return "/" + user;
  },
  categoryStacks: function categoryStacks(category) {
    if (category === void 0) {
      category = ':category(applications|models)';
    }

    return "/" + category;
  },
  categoryUserStacks: function categoryUserStacks(user, category) {
    if (user === void 0) {
      user = ':user';
    }

    if (category === void 0) {
      category = ':category(applications|models)';
    }

    return "/" + user + "/" + category;
  },
  stackDetails: function stackDetails(user, id) {
    if (user === void 0) {
      user = ':user';
    }

    if (id === void 0) {
      id = ':stack';
    }

    return "/" + user + "/" + id + (id === ':stack' ? '+' : '');
  },
  reports: function reports(user) {
    if (user === void 0) {
      user = ':user';
    }

    return "/" + user + "/d";
  },
  reportsDetails: function reportsDetails(user, id) {
    if (user === void 0) {
      user = ':user';
    }

    if (id === void 0) {
      id = ':id';
    }

    return "/" + user + "/d/" + id;
  },
  jobs: function jobs(user) {
    if (user === void 0) {
      user = ':user';
    }

    return "/" + user + "/j";
  },
  jobsDetails: function jobsDetails(user, id) {
    if (user === void 0) {
      user = ':user';
    }

    if (id === void 0) {
      id = ':id';
    }

    return "/" + user + "/j/" + id;
  },
  settings: function settings() {
    return '/settings';
  },
  accountSettings: function accountSettings() {
    return '/settings/account';
  },
  usersSettings: function usersSettings() {
    return '/settings/users';
  }
};

module.exports = routes;
//# sourceMappingURL=routes.js.map
