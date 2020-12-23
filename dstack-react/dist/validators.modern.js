var isValidUserName = function isValidUserName(userName) {
  var errors = {
    notAllowedCharacters: 'notAllowedCharacters',
    tooShort: 'tooShort',
    tooLong: 'tooLong'
  };
  var testRegexp = /^[a-zA-Z0-9-_]+$/;
  if (userName.length < 3) return {
    isValid: false,
    error: errors.tooShort
  };
  if (userName.length > 24) return {
    isValid: false,
    error: errors.tooLong
  };
  if (!testRegexp.test(userName) || /--/.test(userName)) return {
    isValid: false,
    error: errors.notAllowedCharacters
  };
  return {
    isValid: true
  };
};
var isEmail = function isEmail(value) {
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(value);
};
var isRequired = function isRequired(value) {
  return !(value === null || value === undefined || value === '');
};
var noSpaces = function noSpaces(value) {
  return /^[\S]*$/.test(value);
};
var isValidStackName = function isValidStackName(value) {
  return /^[^\/]/.test(value) && /^[a-zA-Z0-9\/_]+$/.test(value);
};
var isValidEmail = function isValidEmail(mail) {
  var errors = {
    invalidEmailAddress: 'invalidEmailAddress'
  };
  if (!isEmail(mail)) return {
    isValid: false,
    error: errors.invalidEmailAddress
  };
  return {
    isValid: true
  };
};
var isValidPassword = function isValidPassword(password) {
  var errors = {
    mustNotBeEmpty: 'mustNotBeEmpty'
  };
  if (password.length === 0) return {
    isValid: false,
    error: errors.mustNotBeEmpty
  };
  return {
    isValid: true
  };
};

export { isEmail, isRequired, isValidEmail, isValidPassword, isValidStackName, isValidUserName, noSpaces };
//# sourceMappingURL=validators.modern.js.map
