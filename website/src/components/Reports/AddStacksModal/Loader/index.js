// @flow

import React from 'react';
import css from './styles.module.css';

type Props = {}

const Loader = ({}: Props) => {
    return (
        <div className={css.loader}>
            <div className={css.text} />

            <div className={css.grid}>
                <div className={css.item}>
                    <div className={css.pic} />
                    <div className={css.section} />
                </div>

                <div className={css.item}>
                    <div className={css.pic} />
                    <div className={css.section} />
                </div>

                <div className={css.item}>
                    <div className={css.pic} />
                    <div className={css.section} />
                </div>
            </div>
        </div>
    );
};

export default Loader;
