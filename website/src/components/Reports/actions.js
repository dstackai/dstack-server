import {apiFabric} from 'utils/apiFabric';
import {useAppStore} from 'AppStore';
import config from 'config';

const api = apiFabric();

export default () => {
    const [{apiUrl}] = useAppStore();

    const createReport = (userName: string) => {
        return new Promise(async resolve => {
            try {
                const request = await api.post(apiUrl + config.DASHBOARD_CREATE, {user: userName});

                resolve(request.data);
            } catch (e) {
                resolve({});
            }
        });
    };

    const updateReport = (userName: string, id: string, fields: {}) => {
        return new Promise(async resolve => {
            try {
                const request = await api.post(apiUrl + config.DASHBOARD_UPDATE, {
                    user: userName,
                    id,
                    ...fields,
                });

                resolve(request.data);
            } catch (e) {
                resolve({});
            }
        });
    };

    const deleteReport = (userName: string, reportId: string) => {
        return new Promise(async resolve => {
            try {
                const request = await api.post(apiUrl + config.DASHBOARD_DELETE, {
                    user: userName,
                    id: reportId,
                });

                resolve(request.data);
            } catch (e) {
                resolve({});
            }
        });
    };

    const reportInsertCard = (userName: string, id: string, cards: Array<{}>, index) => {
        return new Promise(async resolve => {
            try {
                const request = await api.post(apiUrl + config.DASHBOARD_CARDS_INSERT + '?attachments=true', {
                    user: userName,
                    dashboard: id,
                    cards,
                    index,
                });

                resolve(request.data);
            } catch (e) {
                resolve({});
            }
        });
    };

    const reportUpdateCard = (userName: string, id: string, stack: string, fields: {}) => {
        return new Promise(async resolve => {
            try {
                const request = await api.post(apiUrl + config.DASHBOARD_CARDS_UPDATE, {
                    user: userName,
                    dashboard: id,
                    stack,
                    ...fields,
                });

                resolve(request.data);
            } catch (e) {
                resolve({});
            }
        });
    };

    const reportDeleteCard = (userName: string, id: string, stack: string) => {
        return new Promise(async resolve => {
            try {
                const request = await api.post(apiUrl + config.DASHBOARD_CARDS_DELETE, {
                    user: userName,
                    dashboard: id,
                    stack,
                });

                resolve(request.data);
            } catch (e) {
                resolve({});
            }
        });
    };

    return {createReport, deleteReport, updateReport, reportInsertCard, reportUpdateCard, reportDeleteCard};
};
