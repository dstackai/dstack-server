import axios from 'axios';
import {get as _get} from 'lodash-es';
import config from 'config';

const apiFabric = ({apiUrl} = {}) => {
    const CancelToken = axios.CancelToken;

    const instance = axios.create({
        baseURL: apiUrl,
        crossDomain: true,
    });

    instance.cancelToken = CancelToken;

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

    return instance;
};

export default apiFabric;

