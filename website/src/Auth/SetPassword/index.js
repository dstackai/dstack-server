import React, {useState} from 'react';
import {connect} from 'react-redux';
import {useTranslation} from 'react-i18next';
import Auth from 'Auth';
import TextField from 'components/TextField';
import Button from 'components/Button';
import {useAppStore} from 'AppStore';
import appStoreActionTypes from 'AppStore/actionsTypes';
import {parseSearch} from 'utils';
import {updatePassword} from './actions';
import {fetchUser} from 'App/actions';

import css from 'Auth/form.module.css';

type Props = {
    fetchUser: Function,
    updatePassword: Function,
    loading: boolean,
    location: {search: ?string},
    errors: {[key: string]: Array<string>},
};

const SetPassword = ({loading, errors, updatePassword, fetchUser, location, history: {push}}: Props) => {
    const {t} = useTranslation();
    const [form, setForm] = useState({password: ''});
    const [, dispatch] = useAppStore();

    const submitHandle = (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();

        updatePassword({
            ...form,
            ...parseSearch(location.search),
        }, () => {
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
            <form className={css.form} noValidate onSubmit={submitHandle}>
                <div className={css.title}>{t('hiAgain')} 👋</div>
                <div className={css.subtitle}>{t('createANewPasswordAndReLoginInYourAccount')}:</div>

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
                    isShowSpinner={loading}
                    type="submit"
                    className={css.button}
                    size="large"
                    color="primary"
                >
                    {loading ? t('reLoggingIn') : t('reLogIn')}
                </Button>
            </form>
        </Auth>
    );
};

export default connect(
    state => ({
        loading: state.auth.setPassword.loading,
        errors: state.auth.setPassword.errors,
    }),
    {updatePassword, fetchUser}
)(SetPassword);
