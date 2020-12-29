// @flow
import api from 'api';
import {get as _get} from 'lodash-es';
import actionsTypes from './actionsTypes';
import config from 'config';

export const fetchAttachment = (stack, frameId, id, onSuccess?: Function) => async (dispatch: Function) => {
    dispatch({
        type: actionsTypes.FETCH_ATTACHMENT,
        meta: {id: frameId},
    });

    try {
        const request = await api.get(config.STACK_ATTACHMENT(stack, frameId, id));

        dispatch({
            type: actionsTypes.FETCH_ATTACHMENT_SUCCESS,
            meta: {id: frameId},
            payload: request.data.attachment,
        });

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
            type: actionsTypes.FETCH_ATTACHMENT_FAIL,
            meta: {id: frameId},
            payload: {error},
        });
    }
};

export const fetchList = (userName, onSuccess: Function) => async (dispatch: Function) => {
    dispatch({type: actionsTypes.FETCH});

    try {
        const request = await api.get((
            userName
                ? config.USER_STACK_LIST(userName)
                : config.STACK_LIST
        ));

        dispatch({
            type: actionsTypes.FETCH_SUCCESS,
            payload: _get(request, 'data.stacks', []),
        });

        if (onSuccess)
            onSuccess();
    } catch (e) {
        let error = 'Unknown error';

        try {
            error = JSON.parse(_get(e, 'request.response')).message;
        } catch (e) {
            console.log(error);
        }

        const requestStatus = _get(e, 'request.status');

        dispatch({
            type: actionsTypes.FETCH_FAIL,
            payload: {error, requestStatus},
        });
    }
};

export const deleteStack = (stack, onSuccess) => async (dispatch: Function, getState: Function) => {
    dispatch({type: actionsTypes.DELETE});

    const {userData} = getState().app;

    try {
        await api.post(config.DELETE_STACK(), {
            user: userData.user,
            name: stack,
        });

        dispatch({
            type: actionsTypes.DELETE_SUCCESS,
            payload: stack,
        });

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
            type: actionsTypes.FETCH_FAIL,
            payload: {error},
        });
    }
};
