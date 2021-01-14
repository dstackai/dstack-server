import {useEffect, useRef} from 'react';

export default value => {
    const ref = useRef(value);

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref.current;
};
