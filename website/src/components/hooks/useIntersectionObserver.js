// @flow
import {useCallback, useEffect, useRef} from 'react';

export default (
    callBack: Function,

    {
        rootMargin = '0px',
        threshold = 0.01,
        root = null,
    }: {[key: string]: any},

    deps: Array<any>
) => {
    const ref = useRef(null);

    const intersectionCallback = useCallback(([target]) => {
        if (target.isIntersecting) {
            callBack();
        }
    }, deps);

    useEffect(() => {
        const options = {
            root,
            rootMargin,
            threshold,
        };

        const observer = new IntersectionObserver(intersectionCallback, options);

        if (ref && ref.current)
            observer.observe(ref.current);

        return () => {
            if (ref.current)
                observer.unobserve(ref.current);
        };
    }, [ref, intersectionCallback]);

    return [ref];
};