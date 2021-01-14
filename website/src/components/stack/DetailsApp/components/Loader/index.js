// @flow

import React from 'react';
import cn from 'classnames';
import css from './styles.module.css';

type Props = {}

const Loader = ({className}: Props) => {
    return (
        <div className={cn(css.loader, className)}>
            <div className={css.side} />
            <div className={css.content} />
        </div>
    );
};

export default Loader;
