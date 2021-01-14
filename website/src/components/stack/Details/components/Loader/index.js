// @flow

import React from 'react';
import css from './styles.module.css';

type Props = {}

const Loader = ({}: Props) => {
    return (
        <div className={css.loader}>
            <div className={css.title} />
            <div className={css.label} />
            <div className={css.description} />
            <div className={css.diagram} />
        </div>
    );
};

export default Loader;
