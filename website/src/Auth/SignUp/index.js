import React, {useState} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {TextField, Button, appStoreActionTypes, useAppStore} from '@dstackai/dstack-react';
import Auth from 'Auth';
import routes from 'routes';
import {signUp} from './actions';
import {fetchUser} from 'App/actions';
import {parseSearch} from '@dstackai/dstack-react/dist/utils';
import {isValidEmail, isValidUserName, isValidPassword} from '@dstackai/dstack-react/dist/validators';

import css from 'Auth/form.module.css';

type Props = {
    fetchUser: Function,
    loading: boolean,
    errors: {[key: string]: Array<string>},
    signUp: Function,
    history: {push: Function},
};

const SignUp = ({loading, fetchUser, errors, signUp, history: {push}}: Props) => {
    const {t} = useTranslation();
    const searchParams = parseSearch(location.search);
    const [, dispatch] = useAppStore();

    const validations = {
        name: isValidUserName,
        email: isValidEmail,
        password: isValidPassword,
    };

    const [formErrors, setFormErrors] = useState({
        name: null,
        email: null,
        password: null,
    });

    const [form, setForm] = useState({
        name: '',
        email: searchParams.email || '',
        password: '',
        code: searchParams.code,
    });

    const submitHandle = (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        let isValid = true;
        const errors = {};

        Object.keys(validations).forEach(key => {
            const result = validations[key](form[key]);

            isValid = isValid && result.isValid;

            if (!result.isValid)
                errors[key] = [t(result.error)];
        });

        setFormErrors({
            ...formErrors,
            ...errors,
        });

        if (isValid) {
            const params = {...form};

            signUp(params, () => {
                fetchUser().then(
                    data => {
                        dispatch({
                            type: appStoreActionTypes.FETCH_CURRENT_USER_SUCCESS,
                            payload: data,
                        });

                        if (form.code)
                            push(routes.categoryStacks(data.user, 'applications'));
                        else
                            push(routes.confirmEmailMessage());
                    },
                );
            });
        }
    };

    const changeHandle = ({target: {name, value, type, checked}}: SyntheticEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [name]: type === 'checkbox' ? checked : value,
        });

        if (validations[name])
            setFormErrors({
                ...formErrors,
                [name]: null,
            });
    };

    const getErrors = name => {
        if (errors[name] && errors[name].length)
            return errors[name];

        if (formErrors[name])
            return [formErrors[name]];
    };

    return (
        <Auth>
            <form className={css.form} noValidate onSubmit={submitHandle}>
                <div className={css.title}>{t('welcomeToDStack')} 👋</div>
                <div className={css.subtitle}>{t('singlePlatformToTrackAndShareAllYourDataVisualizations')}</div>

                <TextField
                    className={css.field}
                    label={t('username')}
                    name="name"
                    placeholder={'jane_doe'}
                    value={form.name}
                    errors={getErrors('name')}
                    onChange={changeHandle}
                />

                <TextField
                    readOnly={searchParams.email}
                    className={css.field}
                    label={t('workEmailAddress')}
                    type="email"
                    name="email"
                    value={form.email}
                    placeholder={'jane@example.com'}
                    errors={getErrors('email')}
                    onChange={changeHandle}
                />

                <TextField
                    className={css.field}
                    label={t('password')}
                    type="password"
                    name="password"
                    value={form.password}
                    errors={getErrors('password')}
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
                    {loading
                        ? t('signingUp')
                        : t('signUp')
                    }
                </Button>

                <p>
                    {t('alreadyHaveAnAccount')} <Link to={routes.authLogin()}>{t('logIn')}</Link>
                </p>
            </form>
        </Auth>
    );
};

export default connect(
    state => ({
        loading: state.auth.signUp.loading,
        errors: state.auth.signUp.errors,
    }),
    {signUp, fetchUser}
)(SignUp);
