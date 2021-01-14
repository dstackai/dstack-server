// @flow
import {useEffect, useCallback, useRef} from 'react';

const useTimeout = (
    callback, // function to call. No args passed.
    timeout = 0, // delay, ms (default: immediately put into JS Event Queue)
) => {
    const timeoutIdRef = useRef();
    const cancel = useCallback(
        () => {
            const timeoutId = timeoutIdRef.current;

            if (timeoutId) {
                timeoutIdRef.current = undefined;
                clearTimeout(timeoutId);
            }
        },
        [timeoutIdRef],
    );

    useEffect(
        () => {
            timeoutIdRef.current = setTimeout(callback, timeout);
            return cancel;
        },
        [callback, timeout, cancel],
    );

    return cancel;
};

export default useTimeout;