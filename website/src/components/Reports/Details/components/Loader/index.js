// @flow

import React from 'react';
import css from './styles.module.css';

type Props = {}

const Loader = ({}: Props) => {
    return (
        <div className={css.loader}>
            <div className={css.text} />
            <div className={css.filters} />

            <div className={css.grid}>
                <div className={css.item} />
                <div className={css.item} />
            </div>
        </div>
    );
};

export default Loader;
