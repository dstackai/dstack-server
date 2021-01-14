import apiFabric from './apiFabric';
import parseSearch from './parseSearch';
import getDataFailedRequest from './getDataFailedRequest';
import unicodeBase64Decode from './unicodeBase64Decode';
import formatBytes from './formatBytesSize';
import downloadFile from './downloadFile';
import parseStackParams from './parseStackParams';
import parseStackTabs from './parseStackTabs';
import getFormattedDuration from './getFormattedDuration';
import getStackCategory from './getStackCategory';
import fileToBaseTo64 from './fileToBaseTo64';
import dataFetcher from './dataFetcher';
import parseStackViews from './parseStackViews';
import config from 'config';

const isSignedIn = () => {
    const token = localStorage.getItem(config.TOKEN_STORAGE_KEY);

    return Boolean(token);
};

export {
    apiFabric,
    isSignedIn,
    downloadFile,
    formatBytes,
    parseSearch,
    getDataFailedRequest,
    unicodeBase64Decode,
    parseStackParams,
    parseStackTabs,
    getFormattedDuration,
    getStackCategory,
    fileToBaseTo64,
    dataFetcher,
    parseStackViews
};
