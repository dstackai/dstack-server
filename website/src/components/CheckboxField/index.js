// @flow

import React from 'react';
import cx from 'classnames';
import css from './styles.module.css';

type Props = {
    className?: string,
    onChange?: Function,
    value?: boolean,
    appearance: 'checkbox' | 'switcher',
    align: 'left' | 'right',
    label?: string,
    onLabel?: string,
    offLabel?: string,
    children?: any,
}

const CheckboxField = ({
    className,
    value,
    disabled,
    appearance = 'checkbox',
    align = 'left',
    label,
    onLabel,
    offLabel,
    children,
    ...props
}: Props) => {
    return (
        <label className={cx(css.checkbox, className, appearance, align, {disabled})}>
            <div>
                <input
                    type="checkbox"
                    checked={value}
                    {...props}
                />

                {offLabel && <span
                    className={cx(css['toggle-label'], 'off')}
                    dangerouslySetInnerHTML={{__html: offLabel}}
                />}

                <div className={css.wrapper}>
                    <div className={cx(css.mark, 'mdi', 'mdi-check', {'toggle-color': !(onLabel && offLabel)})} />
                </div>

                {onLabel && <span
                    className={cx(css['toggle-label'], 'on')}
                    dangerouslySetInnerHTML={{__html: onLabel}}
                />}

                {label && <span className={css.label}>{label}</span>}
            </div>

            {children}
        </label>
    );
};

export default CheckboxField;
