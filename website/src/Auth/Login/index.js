// @flow
import React, {useState} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import {get} from 'lodash-es';
import {useTranslation} from 'react-i18next';
import Auth from 'Auth';
import TextField from 'components/TextField';
import Button from 'components/Button';
import {useAppStore} from 'AppStore';
import appStoreActionTypes from 'AppStore/actionsTypes';
import routes from 'routes';
import {login} from './actions';
import {fetchUser} from 'App/actions';

import css from 'Auth/form.module.css';

type Props = {
    loading: boolean,
    login: Function,
    errors: {[key: string]: Array<string>},
    history: {push: Function}
};

const Login = ({login, loading, errors, history: {push}, fetchUser}: Props) => {
    const {t} = useTranslation();
    const [storeData, dispatch] = useAppStore();
    const emailEnabled = get(storeData, 'configInfo.data.email_enabled');

    const [form, setForm] = useState({
        user: '',
        password: '',
    });

    const submitHandle = (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();

        login(form, () => {
            fetchUser().then(
                data => {
                    dispatch({
                        type: appStoreActionTypes.FETCH_CURRENT_USER_SUCCESS,
                        payload: data,
                    });

                    push('/');
                },
            );
        });
    };

    const changeHandle = ({target: {name, value}}: SyntheticEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [name]: value,
        });
    };

    return (
        <Auth>
            <form className={css.form} onSubmit={submitHandle} noValidate>
                <div className={css.title}>{t('welcomeToDStack')} 👋</div>

                <div className={css.subtitle}>{t('singlePlatformToTrackAndShareAllYourDataVisualizations')}</div>

                <TextField
                    className={css.field}
                    label={t('username')}
                    name="user"
                    value={form.user}
                    errors={errors.user}
                    onChange={changeHandle}
                />

                <TextField
                    className={css.field}
                    label={t('password')}
                    type="password"
                    name="password"
                    value={form.password}
                    errors={errors.password}
                    onChange={changeHandle}
                />

                <Button
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    size="large"
                    className={css.button}
                    color="primary"
                    isShowSpinner={loading}
                >
                    {loading ? t('loggingIn') :  t('logIn')}
                </Button>

                <p>
                    <Link to={routes.authForgetPassword()}>{t('forgotPassword')}</Link>
                </p>

                {emailEnabled && (
                    <p>
                        {t('dontHaveAnAccount')} <Link to={routes.authSignUp()}>{t('signUp')}</Link>
                    </p>
                )}
            </form>
        </Auth>
    );
};

export default connect(
    state => ({
        loading: state.auth.login.loading,
        errors: state.auth.login.errors,
    }),
    {fetchUser, login},
)(Login);
