import React from 'react';
import {Link} from 'react-router-dom';
import cx from 'classnames';
import css from './styles.module.css';
import logo from 'assets/logo.svg';

type Props = {
    setSearch: Function,
    toggleMenu: Function,
    search: string,
    searchPlaceholder: ?string,
    className?: string,

    match: {
        params: {
            user?: string
        }
    }
}

const Header = ({
    className,
    toggleMenu,
}: Props) => {
    return <div className={cx(css.header, className)}>
        <Link to="/" className={css.logo}>
            <img width="129" height="35" src={logo} alt="logo"/>
        </Link>

        <div className={cx(css.menu, 'mdi mdi-menu')} onClick={toggleMenu} />
    </div>;
};

export default Header;
