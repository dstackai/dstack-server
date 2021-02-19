// @flow
import api from 'api';
import _get from 'lodash';
import actionsTypes from './actionsTypes';
import config from 'config';

export const login = (data: {[key: string]: any}, onSuccess: Function) => async (dispatch: Function) => {
    dispatch({type: actionsTypes.USER_LOGIN});

    try {
        const request = await api.get(config.LOGIN_URL, {params: {...data}});

        dispatch({type: actionsTypes.USER_LOGIN_SUCCESS});
        localStorage.setItem(config.TOKEN_STORAGE_KEY, request.data.session);

        if (onSuccess)
            onSuccess();
    } catch (e) {
        let error = 'Unknown error';

        try {
            error = JSON.parse(_get(e, 'request.response')).message;
        } catch (e) {
            console.log(error);
        }

        dispatch({
            type: actionsTypes.USER_LOGIN_FAIL,
            payload: {errors: {password: [error]}},
        });
    }
};
