import axios from 'axios';
import _get from 'lodash/get';
import config from 'config';

const fetcher = async (url: string, responseDataFormat = data => data) => {
    const token = localStorage.getItem(config.TOKEN_STORAGE_KEY);

    try {
        const request = await axios({
            url: url,
            headers: {Authorization: token ? `Bearer ${token}` : ''},
        });

        return responseDataFormat(request.data);
    } catch (e) {
        let errorBody = null;

        let status = null;

        try {
            errorBody = JSON.parse(_get(e, 'request.response'));
        } catch (e) {
            console.log(e);
        }

        try {
            status = _get(e, 'request.status');
        } catch (e) {
            console.log(e);
        }

        const error = new Error('An error occurred while fetching the data.');

        error.info = errorBody;
        error.status = status;
        throw error;
    }
};

export default fetcher;
