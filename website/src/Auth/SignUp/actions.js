// @flow
import api from 'api';
import _get from 'lodash/get';
import actionsTypes from './actionsTypes';
import config from 'config';

const signUpErrors = {
    'user already exists': {name: ['Somebody with this username is already registered']},
    'user email already registered': {email: ['Somebody with this email is already registered']},
    'malformed request': {password: ['Malformed request']},
};

export const signUp = (data: {[key: string]: any}, onSuccess?: Function) => async (dispatch: Function) => {
    dispatch({type: actionsTypes.SIGN_UP});

    try {
        const request = await api.post(config.SIGN_UP_URL, data);

        dispatch({type: actionsTypes.SIGN_UP_SUCCESS});
        localStorage.setItem(config.TOKEN_STORAGE_KEY, request.data.session);

        if (onSuccess)
            onSuccess();
    } catch (e) {
        const error = _get(e, 'data.message');

        let errors = {};

        if (signUpErrors[error])
            errors = signUpErrors[error];

        dispatch({
            type: actionsTypes.SIGN_UP_FAIL,
            payload: {errors},
        });
    }
};
