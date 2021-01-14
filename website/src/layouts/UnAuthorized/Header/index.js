import React from 'react';
import {Link} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import cx from 'classnames';
import Button from '../../../components/Button';
import {ReactComponent as Logo} from '../assets/logo.svg';
import css from './styles.module.css';

type Props = {
    className?: string,
}

const Header = ({className}: Props) => {
    const {t} = useTranslation();

    return <div className={cx(css.header, className)}>
        <Link to="/" className={css.logo}>
            <Logo />
        </Link>

        <div className={css.buttons}>
            <Button
                Component={Link}
                to="/auth/login"
                className={css.button}
                color="primary"
                variant="contained"
            >{t('logIn')}</Button>
        </div>
    </div>;
};

export default Header;
