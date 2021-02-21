// @flow
import api from 'api';
import _get from 'lodash/get';
import actionsTypes from './actionsTypes';
import config from 'config';

export const verifyUser = (data: {[key: string]: any}, onSuccess: Function) => async (dispatch: Function) => {
    dispatch({type: actionsTypes.CONFIRM});

    try {
        const request = await api.get(config.VERIFY_EMAIL_URL, {params: {...data}});

        dispatch({type: actionsTypes.CONFIRM_SUCCESS});
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
            type: actionsTypes.CONFIRM_FAIL,
            payload: {error},
        });
    }
};
