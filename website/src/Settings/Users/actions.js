// @flow
import {useAppStore, apiFabric} from '@dstackai/dstack-react';
import config from 'config';

const api = apiFabric();

export default () => {
    const [{apiUrl}] = useAppStore();

    const addUser = (params: {name: string, email?: string, role: string}) => {
        return new Promise(async (resolve, reject) => {
            try {
                const request = await api.post(apiUrl + config.ADMIN_USERS_CREATE, params);

                resolve(request.data);
            } catch (e) {
                reject(e);
            }
        });
    };

    return {addUser};
};
