// @flow
import {useAppStore} from 'AppStore';
import {apiFabric} from 'utils';
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

    const editUser = (params: {name: string}) => {
        return new Promise(async (resolve, reject) => {
            try {
                const request = await api.post(apiUrl + config.ADMIN_USERS_EDIT, params);

                resolve(request.data);
            } catch (e) {
                reject(e);
            }
        });
    };

    const deleteUser = (params: {name: string}) => {
        return new Promise(async (resolve, reject) => {
            try {
                const request = await api.post(apiUrl + config.ADMIN_USERS_DELETE, params);

                resolve(request.data);
            } catch (e) {
                reject(e);
            }
        });
    };

    const resetUserAuthCode = (params: {name: string}) => {
        return new Promise(async (resolve, reject) => {
            try {
                const request = await api.post(apiUrl + config.ADMIN_USERS_RESET, params);

                resolve(request.data);
            } catch (e) {
                reject(e);
            }
        });
    };

    return {addUser, editUser, deleteUser, resetUserAuthCode};
};
