var routes = {
  notFound: () => '/404',
  auth: () => '/auth',
  authLogin: () => '/auth/login',
  verifyUser: () => '/auth/verify',
  authSignUp: () => '/auth/signup',
  authForgetPassword: () => '/auth/forget-password',
  authResetPassword: () => '/auth/reset-password',
  confirmEmailMessage: () => '/auth/confirm-message',
  stacks: (user = ':user') => `/${user}`,
  categoryStacks: (user = ':user', category = ':category') => `/${user}/${category}`,
  stackDetails: (user = ':user', category = ':category', id = ':stack') => `/${user}/${category}/${id}` + (id === ':stack' ? '+' : ''),
  reports: (user = ':user') => `/${user}/d`,
  reportsDetails: (user = ':user', id = ':id') => `/${user}/d/${id}`,
  jobs: (user = ':user') => `/${user}/j`,
  jobsDetails: (user = ':user', id = ':id') => `/${user}/j/${id}`,
  settings: () => '/settings'
};

export default routes;
//# sourceMappingURL=routes.modern.js.map
