import {apiFabric} from 'utils';
import {useAppStore} from 'AppStore';
import config from 'config';

const api = apiFabric();

type executeParams = {
    user: string,
    stack: string,
    frame: string,
    attachment: number,
    apply?: boolean,
    views: Array<{}>,
}

const MB = 1048576;

export default () => {
    const [{apiUrl}] = useAppStore();

    const upload = (params: executeParams) => {
        return new Promise(async (resolve, reject) => {
            try {
                const request = await api.post(apiUrl + config.FILE_UPLOAD, params);

                resolve(request.data);
            } catch (e) {
                reject(e);
            }
        });
    };

    return {upload};
};
