import React from 'react';
import css from './styles.module.css';

type Props = {}

const Loader = ({}: Props) => {
    return (
        <div className={css.loader}>
            <div className={css.title} />
            <div className={css.text} />

            <div className={css.table}>
                <div className={css.item} />
                <div className={css.item} />
                <div className={css.item} />
                <div className={css.item} />
                <div className={css.item} />
                <div className={css.item} />
            </div>
        </div>
    );
};

export default Loader;
