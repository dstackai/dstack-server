// @flow
import React, {useState, useEffect} from 'react';
import cx from 'classnames';
import css from './styles.module.css';

type Props = {
    size?: 'normal' | 'middle' | 'small',
    label?: string,
    className?: string,
    errors?: Array<string>,
}

const validateValue = value => {
    if (typeof value === 'string' || value)
        return value;
    else
        return '';
} ;

const TextField = ({
    label,
    className,
    size = 'normal',
    errors = [],
    value: restValue,
    onChange: restOnChange,
    ...props
}: Props) => {
    const [value, setValue] = useState(() => validateValue(restValue));
    const hasErrors = Boolean(errors.length);

    useEffect(() => {
        if (restValue !== value)
            setValue(validateValue(restValue));
    }, [restValue]);

    const onChange = e => {
        setValue(e.target.value);

        if (typeof restOnChange === 'function')
            restOnChange(e);
    };

    return (
        <div className={cx(css.field, className, size, {disabled: props.disabled})}>
            <label>
                {label && <div className={css.label}>{label}</div>}

                <div className={css.input}>
                    {/*$FlowFixMe*/}
                    <input
                        className={cx({error: hasErrors})}
                        value={value}
                        onChange={onChange}
                        {...props}
                    />
                </div>

                {hasErrors && <div className={css.error}>{errors.join(', ')}</div>}
            </label>
        </div>
    );
};

export default TextField;
