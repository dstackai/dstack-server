// @flow
import {useCallback} from 'react';
import _debounce from 'lodash/debounce';

export default (callback: Function, depsOrDelay: Array<any> | number, deps?: Array<any>) => {
    let delay = 300;

    if (typeof depsOrDelay === 'number')
        delay = depsOrDelay;
    else
        deps = depsOrDelay;


    return useCallback(_debounce(callback, delay), deps);
};