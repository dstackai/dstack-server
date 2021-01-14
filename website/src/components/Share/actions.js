// @flow
import {apiFabric} from 'utils';
import {useAppStore} from 'AppStore';
import config from 'config';
import {isValidEmail} from 'utils/validations';

const api = apiFabric();

export default () => {
    const [{apiUrl}] = useAppStore();

    const checkUser = (userName: string) => {
        return new Promise(async (resolve, reject) => {
            try {
                const request = await api.get(apiUrl + config.CHECK_USER(userName));

                resolve(request.data);
            } catch (e) {
                reject(e);
            }
        });
    };

    type AddPermissionsParams = {
        userName: string,
        instancePath: string,
    }

    const addPermissions = ({userName, instancePath}: AddPermissionsParams) => {
        const params = {path: instancePath};

        if (isValidEmail(userName).isValid)
            params.email = userName;
        else
            params.user = userName;

        return new Promise(async (resolve, reject) => {
            try {
                await api.post(apiUrl + config.PERMISSIONS_ADD, params);
                resolve(params);
            } catch (e) {
                reject(e);
            }
        });
    };

    type RemovePermissionsParams = {
        user: {email: string} | {user?: string},
        instancePath: string,
    }

    const removePermissions = ({user, instancePath}: RemovePermissionsParams) => {
        const params = {
            path: instancePath,
            ...user,
        };

        return new Promise(async (resolve, reject) => {
            try {
                await api.post(apiUrl + config.PERMISSIONS_DELETE, params);

                resolve();
            } catch (e) {
                reject();
            }
        });
    };

    return {checkUser, addPermissions, removePermissions};
};
