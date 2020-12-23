// @flow
import React, {useEffect} from 'react';
import cn from 'classnames';
import {useTranslation} from 'react-i18next';
import {Modal, TextField, SelectField, Button} from '@dstackai/dstack-react';
import {useForm} from '@dstackai/dstack-react/dist/hooks';
import css from './styles.module.css';

type Props = {
    data?: {},
    isShow: boolean,
    onClose: Function,
    submit: Function,
};

const Edit = ({data = {}, isShow, onClose, submit}: Props) => {
    const {form, setForm, onChange} = useForm({});
    const {t} = useTranslation();

    useEffect(() => {
        if (isShow)
            setForm(data);
    }, [isShow]);

    const save = () => {
        checkValidForm();
        submit(form);
    };

    return (
        <Modal
            title={t('addUser')}
            size="small"
            isShow={isShow}
            onClose={onClose}
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
                    onChange={onChange}
                />

                <TextField
                    size="middle"
                    className={css.field}
                    value={form.email}
                    label={t('email')}
                    name={'email'}
                    onChange={onChange}
                />

                <SelectField
                    size="middle"
                    align="bottom"
                    className={cn(css.field, css.select)}
                    value={form.role}
                    name={'role'}
                    label={t('access')}
                    onChange={value => onChange('role', value)}

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

                <div className={css.buttons}>
                    <Button
                        className={css.button}
                        variant="contained"
                        color="primary"
                        onClick={save}
                    >
                        {t('addUser')}
                    </Button>

                    <Button
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