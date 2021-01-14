// @flow

import React from 'react';
import cx from 'classnames';
import Slider from 'rc-slider';
import css from './styles.module.css';

type Props = {
    name?: string,
    label?: string,
    className?: string,
    align: 'left' | 'right',
};

const CustomHandle = props => {
    const style = {
        left: props.offset + '%',
        transform: 'translateX(-50%)',
    };

    return (
        <div className={props.className} key={props.index} style={style} data-value={props.value} />
    );
};

const SliderField = ({className, disabled, label, onChange, name, align = 'left', ...props}: Props) => {
    const onChangeHandle = value => {
        if (onChange)
            onChange({
                target: {
                    value,
                    name,
                },
            });
    };

    return (
        <div className={cx(css.field, className, align, {disabled})}>
            <div className={css.slider}>
                <Slider
                    onChange={onChangeHandle}
                    tipFormatter={value => `$${value}`}
                    handle={CustomHandle}
                    {...props}
                />
            </div>

            {label && <span className={css.label}>{label}</span>}
        </div>
    );
};

export default SliderField;
