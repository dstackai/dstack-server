// @flow
import React, {forwardRef} from 'react';
import type {Node} from 'react';
import cx from 'classnames';
import css from './style.module.css';
import Spinner from 'components/Spinner';

type Props = {
    Component?: any,
    children?: Node,
    className?: string,
    size?: 'small' | 'normal' | 'large',
    color?: 'default' | 'primary' | 'secondary' | 'lilac' | 'success' | 'fail',
    variant?: 'default' | 'contained' | 'outlined',
    isShowSpinner?: boolean,
    fullWidth?: boolean,
    onClick?: Function,
};

const Button:Props = forwardRef((
    {
        Component = 'button',
        children,
        className,
        size = 'normal',
        color = 'default',
        variant = 'default',
        fullWidth = false,
        isShowSpinner,
        ...props
    },

    ref
) => {
    return (
        <Component
            ref={ref}
            className={
                cx(css.button, size, `color-${color}`, `variant-${variant}`, className, {'full-width': fullWidth})
            }

            {...props}
        >
            {isShowSpinner && <Spinner className={css.spinner} color="white" isShown />}
            {children}
        </Component>
    );
});

export default Button;
