const formatBytes = (bytes, decimals) => {
    if (bytes === 0) return '0 Bytes';
    
    let k = 1024;

    let dm = decimals <= 0 ? 0 : decimals || 2;

    let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    let i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export default formatBytes;