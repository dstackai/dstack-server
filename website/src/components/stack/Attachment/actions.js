import axios from 'axios';
import {get as _get} from 'lodash-es';
import actionsTypes from './actionsTypes';
import config from 'config';
import {useStateValue} from './store';

export default () => {
    const [{apiUrl}, dispatch] = useStateValue();

    const fetchAttachment = async (stack, frameId, id, onSuccess) => {
        const token = localStorage.getItem(config.TOKEN_STORAGE_KEY);

        dispatch({
            type: actionsTypes.FETCH,
            meta: {frameId, id},
        });

        try {
            const request = await axios({
                baseURL: apiUrl,
                url: config.STACK_ATTACHMENT(stack, frameId, id),
                headers: {Authorization: token ? `Bearer ${token}` : ''},
            });

            dispatch({
                type: actionsTypes.FETCH_SUCCESS,
                meta: {frameId, id},
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
                type: actionsTypes.FETCH_FAIL,
                meta: {frameId, id},
                payload: {error},
            });
        }
    };

    return {fetchAttachment};
};
