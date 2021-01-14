// @flow
import React, {useEffect} from 'react';
import cn from 'classnames';
import {useTranslation} from 'react-i18next';
import Button from 'components/Button';
import Modal from 'components/Modal';
import TextField from 'components/TextField';
import SelectField from 'components/SelectField';
import Copy from 'components/Copy';
import {useForm} from 'hooks';
import css from './styles.module.css';

type Props = {
    data?: {},
    isShow: boolean,
    onClose: Function,
    submit: Function,
    loading: boolean,
    getAuthLink: Function,
};

const Edit = ({data = {}, isShow, onClose, submit, loading, refresh, getAuthLink}: Props) => {
    const {form, setForm, formErrors, checkValidForm, onChange} = useForm(data, {
        name: ['required'],
        email: ['email'],
        role: ['required'],
    });

    const {t} = useTranslation();

    useEffect(() => {
        if (isShow)
            setForm(data);

    }, [isShow]);

    const getErrorsText = fieldName => {
        if (formErrors[fieldName] && formErrors[fieldName].length)
            return [t(`formErrors.${formErrors[fieldName][0]}`)];
    };

    const save = () => {
        const isValid = checkValidForm();

        if (isValid)
            submit(form);
    };

    return (
        <Modal
            title={data.token ? t('editUser') : t('addUser')}
            size="small"
            isShow={isShow}
            onClose={loading ? undefined : onClose}
            withCloseButton
            dialogClassName={css.dialog}
        >
            <div className={css.form}>
                <TextField
                    size="middle"
                    className={css.field}
                    value={form.name}
                    label={t('username')}
                    name={'name'}
                    placeholder={t('enterUsernameWithoutSpaces')}
                    errors={getErrorsText('name')}
                    onChange={onChange}
                    readOnly={data.token}
                />

                <TextField
                    size="middle"
                    className={css.field}
                    value={form.email}
                    label={t('email')}
                    name={'email'}
                    onChange={onChange}
                    errors={getErrorsText('email')}
                />

                <SelectField
                    size="middle"
                    align="bottom"
                    className={cn(css.field, css.select)}
                    value={form.role}
                    name={'role'}
                    label={t('access')}
                    onChange={value => onChange('role', value)}
                    errors={getErrorsText('role')}

                    options={[
                        {
                            label: t('admin'),
                            value: 'admin',
                        },
                        {
                            label: t('readAndWrite'),
                            value: 'write',
                        },
                        {
                            label: t('readOnly'),
                            value: 'read',
                        },
                    ]}
                />

                {data.token && (
                    <div className={css.fieldWrap}>
                        <TextField
                            label={t('loginLink')}
                            size="middle"
                            className={css.field}
                            readOnly
                            value={getAuthLink(data)}
                        />

                        {refresh && (
                            <div
                                className={css.refresh}
                                onClick={refresh}
                            >
                                <span className={cn(css.icon, 'mdi mdi-refresh')} />
                            </div>
                        )}

                        <Copy
                            className={css.copy}
                            buttonTitle={null}
                            copyText={getAuthLink(data)}
                        />
                    </div>
                )}

                <div className={css.buttons}>
                    <Button
                        disabled={loading}
                        className={css.button}
                        variant="contained"
                        color="primary"
                        onClick={save}
                    >
                        {data.token ? t('save') : t('addUser')}
                    </Button>

                    <Button
                        disabled={loading}
                        className={css.button}
                        variant="contained"
                        color="secondary"
                        onClick={onClose}
                    >
                        {t('cancel')}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default Edit;