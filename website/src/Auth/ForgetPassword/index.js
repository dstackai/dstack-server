import React, {useState} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import Auth from 'Auth';
import TextField from 'components/TextField';
import Button from 'components/Button';
import routes from 'routes';
import {resetPassword} from './actions';

import css from 'Auth/form.module.css';

type Props = {
    resetPassword: Function,
    loading: boolean,
    errors: {[key: string]: Array<string>},
};

const ForgetPassword = ({loading, errors, resetPassword}: Props) => {
    const {t} = useTranslation();
    const [form, setForm] = useState({email: ''});
    const [isSuccess, setIsSuccess] = useState(false);

    const submitHandle = (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        resetPassword(form.email, () => setIsSuccess(true));
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
                <div className={css.title}>{t('forgotPassword')}</div>
                {isSuccess && <div className={css.subtitle}>{t('itsNotAProblem')}👌</div>}
                {isSuccess && <div className={css.subtitle}>{t('weVeJustSentYouTheLinkToRecoverThePassword')}</div>}

                {!isSuccess && <TextField
                    className={css.field}
                    label={t('emailAddress')}
                    type="email"
                    name="email"
                    value={form.email}
                    errors={errors.email}
                    onChange={changeHandle}
                />}

                {!isSuccess && <Button
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    isShowSpinner={loading}
                    type="submit"
                    className={css.button}
                    size="large"
                    color="primary"
                >
                    {loading ? t('sending') : t('send')}
                </Button>}

                {!isSuccess && <p>
                    <Link to={routes.authLogin()}>{t('logIn')}</Link>
                </p>}
            </form>
        </Auth>
    );
};

export default connect(
    state => ({
        loading: state.auth.forgetPassword.loading,
        errors: state.auth.forgetPassword.errors,
    }),
    {resetPassword}
)(ForgetPassword);
