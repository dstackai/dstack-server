export default ({application, contentType}) => {
    switch (true) {
        case (contentType === 'image/svg+xml'):
        case (contentType === 'image/png'):
        case (contentType === 'image/jpeg'):
        case (application === 'plotly'):
        case (application === 'bokeh'):
            return 'chart';

        case (contentType === 'text/csv'):
            return 'table';

        case (application === 'sklearn'):
        case (/^tensorflow\/*/.test(application)):
        case (/^torch\/*/.test(application)):
            return 'mlModel';

        case (application === 'application/python' && contentType === 'application/octet-stream'):
            return 'app';

        default:
            return null;
    }
};
