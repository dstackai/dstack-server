export const isValidUserName = userName => {
    const errors = {
        notAllowedCharacters: 'notAllowedCharacters',
        tooShort: 'tooShort',
        tooLong: 'tooLong',
    };

    const testRegexp = /^[a-zA-Z0-9-_]+$/;

    if (userName.length < 3)
        return {
            isValid: false,
            error: errors.tooShort,
        };

    if (userName.length > 24)
        return {
            isValid: false,
            error: errors.tooLong,
        };

    if (!testRegexp.test(userName) || /--/.test(userName))
        return {
            isValid: false,
            error: errors.notAllowedCharacters,
        };

    return {isValid: true};
};

export const isEmail = value => {
    if (!value)
        return true;

    return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(value);
};

export const isRequired = value => {
    return !(value === null || value === undefined || value === '');
};

export const noSpaces = value => {
    return /^[\S]*$/.test(value);
};

export const isValidStackName = value => {
    return /^[^\/]/.test(value) && /^[a-zA-Z0-9\/_]+$/.test(value);
};

export const isValidEmail = mail => {
    const errors = {invalidEmailAddress: 'invalidEmailAddress'};

    if (mail && !isEmail(mail))
        return {
            isValid: false,
            error: errors.invalidEmailAddress,
        };

    return {isValid: true};
};

export const isValidPassword = password => {
    const errors = {mustNotBeEmpty: 'mustNotBeEmpty'};

    if (password.length === 0)
        return {
            isValid: false,
            error: errors.mustNotBeEmpty,
        };

    return {isValid: true};
};
