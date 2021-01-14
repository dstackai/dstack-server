// @flow

import React from 'react';
import type {Node} from 'react';
import {Portal} from 'react-portal';
import cx from 'classnames';
import css from './styles.module.css';

type Props = {
    title?: string,
    isShow?: boolean,
    className?: string,
    dialogClassName?: string,
    titleClassName?: string,
    size?: 'confirmation' | 'small' | 'big',
    onClose: Function,
    children?: Node,
    withCloseButton?: boolean,
};

const Modal = ({
    title,
    className,
    dialogClassName,
    titleClassName,
    size = 'big',
    onClose,
    isShow,
    children,
    withCloseButton,
}: Props) => {
    const onClickByLayer = event => {
        if (event.currentTarget === event.target && onClose)
            onClose();
    };

    return (
        <Portal>
            <div className={cx(css.modal, className, {show: isShow})} onClick={onClickByLayer}>
                <div className={cx(css.dialog, size, dialogClassName)}>
                    {withCloseButton && <span className={cx(css.close, 'mdi mdi-close')} onClick={onClose} />}

                    {title && <div className={cx(css.title, titleClassName)}>{title}</div>}
                    {children}
                </div>
            </div>
        </Portal>
    );
};

export default Modal;
