import {useEffect, useState} from 'react';

export default (id, defaultValue = 'list') => {
    const [value, setValue] = useState(null);

    useEffect(() => {
        const savedValue = localStorage.getItem(`list-view-value-${id}`);

        if (savedValue)
            setValue(savedValue);
        else
            setValue(defaultValue);

    }, []);

    const onChange = value => {
        setValue(value);
        localStorage.setItem(`list-view-value-${id}`, value);
    };

    return [value, onChange];
};
