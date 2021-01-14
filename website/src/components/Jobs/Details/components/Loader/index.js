// @flow
import React from 'react';
import css from './styles.module.css';

type Props = {}

const Loader = ({}: Props) => {
    return (
        <div className={css.loader}>
            <div className={css.title} />
            <div className={css.text1} />
            <div className={css.text2} />
            <div className={css.code} />
        </div>
    );
};

export default Loader;
