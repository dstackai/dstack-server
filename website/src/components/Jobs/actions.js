import {apiFabric} from 'utils/apiFabric';
import {useAppStore} from 'AppStore';
import config from 'config';

const api = apiFabric();

export default () => {
    const [{apiUrl}] = useAppStore();

    const fetchJob = ({user, id}) => {
        return new Promise(async resolve => {
            try {
                const request = await api.get(apiUrl + config.JOB_DETAILS(user, id));

                resolve(request.data);
            } catch (e) {
                resolve({});
            }
        });
    };

    const runJob = params => {
        return new Promise(async resolve => {
            try {
                const request = await api.post(apiUrl + config.JOB_RUN, params);

                resolve(request.data);
            } catch (e) {
                resolve({});
            }
        });
    };

    const stopJob = params => {
        return new Promise(async resolve => {
            try {
                const request = await api.post(apiUrl + config.JOB_STOP, params);

                resolve(request.data);
            } catch (e) {
                resolve({});
            }
        });
    };

    const createJob = params => {
        return new Promise(async resolve => {
            try {
                const request = await api.post(apiUrl + config.JOB_CREATE, params);

                resolve(request.data);
            } catch (e) {
                resolve({});
            }
        });
    };

    const updateJob = params => {
        return new Promise(async resolve => {
            try {
                const request = await api.post(apiUrl + config.JOB_UPDATE, params);

                resolve(request.data);
            } catch (e) {
                resolve({});
            }
        });
    };

    const removeJob = params => {
        return new Promise(async resolve => {
            try {
                const request = await api.post(apiUrl + config.JOB_DELETE, params);

                resolve(request.data);
            } catch (e) {
                resolve({});
            }
        });
    };

    return {
        fetchJob,
        runJob,
        stopJob,
        createJob,
        updateJob,
        removeJob,
    };
};
