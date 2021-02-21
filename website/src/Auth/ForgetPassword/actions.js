// @flow
import api from 'api';
import _get from 'lodash/get';
import actionsTypes from './actionsTypes';
import config from 'config';

const resetErrors = {
    'user not found': {email: ['User not found']},
    'malformed request': {email: ['Malformed request']},
};

export const resetPassword = (email: string, onSuccess?: Function) => async (dispatch: Function) => {
    dispatch({type: actionsTypes.RESET_PASSWORD});

    try {
        await api.get(config.RESET_PASSWORD_URL, {params: {email}});
        dispatch({type: actionsTypes.RESET_PASSWORD_SUCCESS});

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
            type: actionsTypes.RESET_PASSWORD_FAIL,
            payload: {errors},
        });
    }
};
