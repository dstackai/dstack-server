// @flow
import api from 'api';
import {getDataFailedRequest, downloadFile} from 'utils';
import actionsTypes from './actionsTypes';
import config from 'config';

export const fetchDetails = (userName, stack, onSuccess?: Function) => async (dispatch: Function) => {
    dispatch({type: actionsTypes.FETCH});

    try {
        const request = await api.get(config.STACK_DETAILS(userName, stack));

        dispatch({
            type: actionsTypes.FETCH_SUCCESS,
            payload: request.data.stack,
            meta: {stack: `${userName}/${stack}`},
        });

        if (onSuccess)
            onSuccess();
    } catch (e) {
        dispatch({
            type: actionsTypes.FETCH_FAIL,
            payload: getDataFailedRequest(e),
        });
    }
};


export const fetchFrame = (userName, stack, frameId, onSuccess?: Function) => async (dispatch: Function) => {
    dispatch({type: actionsTypes.FETCH_FRAME});

    try {
        const request = await api.get(config.STACK_FRAME(userName, stack, frameId));

        dispatch({
            type: actionsTypes.FETCH_FRAME_SUCCESS,
            payload: request.data.frame,
        });

        if (onSuccess)
            onSuccess();
    } catch (e) {
        dispatch({
            type: actionsTypes.FETCH_FRAME_FAIL,
            payload: getDataFailedRequest(e),
        });
    }
};

export const downloadAttachment = (stack, frameId, id) => async () => {
    try {
        const url = config.STACK_ATTACHMENT(stack, frameId, id) + '?download=true';
        const request = await api.get(url);

        if (request.data.attachment['download_url'])
            downloadFile({url: request.data.attachment['download_url']});

        else if (request.data.attachment.data)
            downloadFile({
                fileName: `${stack.replace('/', '_')}_${id}.csv`,
                type: request.data.attachment.type,
                blob: atob(request.data.attachment.data),
            });

        console.log(request.data);
    } catch (e) {
        console.log('Download error: ' + e);
    }
};

export const update = ({stack, noUpdateStore, ...params}, onSuccess?: Function) =>
    async (dispatch: Function, getState: Function) => {
        const oldData = getState().stacks.details.data[stack];

        dispatch({
            type: actionsTypes.UPDATE,
            payload: !noUpdateStore ? params : {},
            meta: {stack},
        });

        try {
            await api.post(config.STACK_UPDATE, {
                stack,
                ...params,
            });

            dispatch({
                type: actionsTypes.UPDATE_SUCCESS,
                meta: {stack},
            });

            if (onSuccess)
                onSuccess();
        } catch (e) {
            dispatch({
                type: actionsTypes.UPDATE_FAIL,
                payload: {...getDataFailedRequest(e), data: oldData},
                meta: {stack},
            });
        }
    };

export const clearDetails = () => (dispatch: Function) => {
    dispatch({type: actionsTypes.CLEAR_DETAILS});
};

export const updatePermissions = (stack, permissions) => (dispatch: Function) => {
    dispatch({
        type: actionsTypes.UPDATE_PERMISSIONS,
        payload: permissions,
        meta: {stack},
    });
};
