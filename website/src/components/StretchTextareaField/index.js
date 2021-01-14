// @flow
import React, {useEffect, useState, forwardRef} from 'react';
import cx from 'classnames';
import css from './styles.module.css';

type Props = {
    className?: string,
    value?: ?string,
    placeholder?: string,
}

const StretchTextAreaField = forwardRef(({
    value: propValue,
    placeholder = '',
    className,
    onChange: onChangeProp,
    ...props
}: Props, ref) => {
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
        <div className={css.fieldWrap}>
            <div className={cx(css.field, className)}>
                <textarea
                    rows={1}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    ref={ref}
                    {...props}
                />

                <div className={css.hidden}>
                    {value && value.length ? value : placeholder}
                    {'\n'}
                </div>
            </div>
        </div>
    );
});

export default StretchTextAreaField;
