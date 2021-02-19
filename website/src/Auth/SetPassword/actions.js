// @flow
import api from 'api';
import _get from 'lodash/get';
import actionsTypes from './actionsTypes';
import config from 'config';

const resetErrors = {
    'user not found': {password: ['User not found']},
    'bad credentials': {password: ['Bad credentials']},
    'malformed request': {password: ['Malformed request']},
};

export const updatePassword = (params: {[key: string]: any}, onSuccess?: Function) => async (dispatch: Function) => {
    dispatch({type: actionsTypes.UPDATE_PASSWORD});

    try {
        const request = await api.post(config.UPDATE_PASSWORD_URL, params);

        dispatch({type: actionsTypes.UPDATE_PASSWORD_SUCCESS});
        localStorage.setItem(config.TOKEN_STORAGE_KEY, request.data.session);

        if (onSuccess)
            onSuccess();
    } catch (e) {
        const status = _get(e, 'response.status');
        const error = _get(e, 'data.message');

        let errors = {};

        if (resetErrors[error])
            errors = resetErrors[error];
        else if (status === 404)
            errors = resetErrors['user not found'];

        dispatch({
            type: actionsTypes.UPDATE_PASSWORD_FAIL,
            payload: {errors},
        });
    }
};
