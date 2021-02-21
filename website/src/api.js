import axios from 'axios';
import _get from 'lodash/get';
import config from 'config';

export const CancelToken = axios.CancelToken;

const instance = axios.create({
    baseURL: config.API_URL,
    crossDomain: true,
});

instance.interceptors.request.use(requestConfig => {
    const token = localStorage.getItem(config.TOKEN_STORAGE_KEY);

    requestConfig.headers.Authorization = token ? `Bearer ${token}` : '';
    return requestConfig;
});

instance.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        if (_get(error, 'response.status', null) === 401) {
            return Promise.reject(error.response);
        } else if (_get(error, 'response.status', null) === 400) {
            return Promise.reject(error.response);
        } else {
            return Promise.reject(error);
        }
    }
);

export default instance;
