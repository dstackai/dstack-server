// @flow
import React, {useEffect, useState} from 'react';
import cx from 'classnames';
import css from './styles.module.css';

type Props = {
    className?: string,
    value?: ?string,
    placeholder?: string,
}

const StretchTitleField = ({
    value: propValue,
    placeholder = '',
    className,
    onChange: onChangeProp,
    ...props
}: Props) => {
    const [value, set] = useState(propValue);

    const onChange = event => {
        if (onChangeProp)
            onChangeProp(event.target.value);

        set(event.target.value);
    };

    useEffect(() => {
        set(propValue);
    }, [propValue]);

    return (
        <div className={cx(css.field, className)}>
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                {...props}
            />

            <div className={css.hidden}>
                {value && value.length ? value : placeholder}
            </div>
        </div>
    );
};

export default StretchTitleField;
