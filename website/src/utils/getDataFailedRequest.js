import _get from 'lodash/get';

const getDataFailedRequest = responseError => {
    let error = 'Unknown error';

    try {
        error = JSON.parse(_get(responseError, 'request.response')).message;
    } catch (e) {
        console.log(error, e);
    }

    const requestStatus = _get(responseError, 'request.status');

    return {error, requestStatus};
};

export default getDataFailedRequest;