import {apiFabric} from 'utils';
import {useAppStore} from 'AppStore';
import config from 'config';
import {fileToBaseTo64} from 'utils';

const api = apiFabric();

type uploadParams = {
    file: File,
}

const MB = 1048576;

export default () => {
    const [{apiUrl}] = useAppStore();

    const upload = ({file}: uploadParams) => {
        return new Promise(async (resolve, reject) => {
            const params = {
                'file_name': file.name,
                length: file.size,
            };

            if (file.size < MB)
                params.data = await fileToBaseTo64(file);

            try {
                const request = await api.post(apiUrl + config.FILE_UPLOAD, params);

                console.log(request.data);
                resolve(request.data);
            } catch (e) {
                reject(e);
            }
        });
    };

    return {upload};
};
