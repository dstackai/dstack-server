import React from 'react';
import get from 'lodash/get';
import {Link} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import cx from 'classnames';
import {useAppStore} from 'AppStore';
import Button from 'components/Button';
import routes from 'routes';
import {ReactComponent as Logo} from 'assets/logo.svg';
import css from './styles.module.css';

type Props = {
    className?: string,
}

const Header = ({className}: Props) => {
    const {t} = useTranslation();
    const [{configInfo}] = useAppStore();

    return <div className={cx(css.header, className)}>
        <Link to="/" className={css.logo}>
            <Logo />
        </Link>

        <div className={css.buttons}>
            <Button
                size="small"
                Component={Link}
                to={routes.authLogin()}
                className={css.button}
                color="primary"
                variant="outlined"
            >{t('logIn')}</Button>


            {get(configInfo, 'data.email_enabled') && <Button
                size="small"
                Component={Link}
                to={routes.authSignUp()}
                className={css.button}
                color="primary"
                variant="contained"
            >{t('signUp')}</Button>}
        </div>
    </div>;
};

export default Header;
