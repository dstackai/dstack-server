import React from 'react';
import Header from './Header';
import css from './styles.module.css';

const UnAuthorizedLayout = ({children}) => {
    return (
        <div className={css.layout}>
            <Header className={css.header} />

            <div className={css.main}>
                {children}
            </div>
        </div>
    );
};

export default UnAuthorizedLayout;
