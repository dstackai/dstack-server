const downloadFile = ({url, blob, type, fileName}) => {
    if (blob) {
        const
            link = document.createElement('a');

        link.href = window.URL.createObjectURL(new Blob([blob]));
        link.setAttribute('target', '_blank');
        link.setAttribute('download', fileName);
        link.setAttribute('type', type);

        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
    }

    if (url) {
        const
            link = document.createElement('a');

        link.href = url;
        link.setAttribute('target', '_blank');
        link.setAttribute('download', true);

        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
    }
};

export default downloadFile;