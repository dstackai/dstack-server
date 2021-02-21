import React, {useState, useEffect, useRef, useCallback} from 'react';
import _debounce from 'lodash/debounce';
import {useTranslation} from 'react-i18next';
import {connect} from 'react-redux';
import Button from 'components/Button';
import Dropdown from 'components/Dropdown';
import SettingsInformation from 'components/settings/Information';
import TextField from 'components/TextField';
import UploadStack from 'components/stack/UploadStack';
import config from 'config';
import {updateToken} from '../../App/actions';
import {updateSettings} from './actions';
import css from './styles.module.css';

type Props = {
    updateToken: Function,
    updateSettings: Function,

    currentUser: string,
    currentUserToken: string,

    userData: {
        user: string,
        token: string,
    },
}

const Account = ({updateToken, currentUser, userData, currentUserToken, updateSettings}: Props) => {
    const {t} = useTranslation();
    const availableSendingSettings = useRef(false);
    const [isEditName, setIsEditName] = useState(false);
    const updateSettingsDebounce = useCallback(_debounce(updateSettings, 300), []);

    const dropdownOptionsMap = {
        public: t('public'),
        internal: t('forDstackaiUsersOnly'),
        private: t('forSelectedUsers'),
    };

    const [form, setForm] = useState(
        {'default_access_level': userData?.settings?.general['default_access_level']},
    );

    useEffect(() => {
        setForm({
            ...form,
            'default_access_level': userData?.settings?.general['default_access_level'],
        });
    }, [currentUser]);

    useEffect(() => {
        if (availableSendingSettings.current)
            updateSettingsDebounce({
                user: currentUser,
                general: form,
            });
        else
            availableSendingSettings.current = true;
    }, [form['default_access_level'], form.comments]);

    const cancelEditName = () => {
        setForm({
            ...form,
            name: currentUser,
        });

        setIsEditName(false);
    };

    const onChangeDropdown = value => {
        setForm({'default_access_level': value});
    };

    const onChange = (event: SyntheticEvent) => {
        let {target} = event;

        let {value} = target;

        if (target.type === 'checkbox')
            value = target.checked;

        setForm({
            ...form,
            [event.target.name]: value,
        });
    };

    const createToken = (event: SyntheticEvent) => {
        event.preventDefault();
        updateToken();
    };

    const renderNameField = () => {
        return (
            <div className={css.fields}>
                <TextField
                    className={css.field}
                    name="name"
                    onChange={onChange}
                    size="small"
                    value={form.name}
                />

                <div className={css.buttons}>
                    <Button
                        className={css.button}
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => setIsEditName(false)}
                    >{t('save')}</Button>

                    <Button
                        color="secondary"
                        size="small"
                        className={css.button}
                        onClick={cancelEditName}
                    >{t('cancel')}</Button>
                </div>
            </div>
        );
    };
    
    return (
        <div className={css.account}>
            <div className={css.section}>
                <div className={css['section-title']}>profile</div>

                <div className={css.item}>
                    <div className={css.label}>{t('username')}:</div>

                    {isEditName
                        ? renderNameField()
                        : <div className={css.value}>{currentUser}</div>
                    }
                </div>
            </div>

            <div className={css.section}>
                <div className={css['section-title']}>{t('general')}</div>

                <div className={css.item}>
                    <div className={css.label}>{t('theDefaultAccessLevel')}</div>

                    <Dropdown
                        className={css.dropdown}

                        items={
                            Object
                                .keys(dropdownOptionsMap)
                                .map(key => ({
                                    title: dropdownOptionsMap[key],
                                    value: key,
                                    onClick: () => onChangeDropdown(key),
                                }))
                        }
                    >
                        <Button
                            className={css.dropdownButton}
                            color="primary"
                            size="small"
                        >
                            {dropdownOptionsMap[form['default_access_level']]}
                            <span className="mdi mdi-chevron-down" />
                        </Button>
                    </Dropdown>
                </div>
            </div>

            <div className={css.section}>
                <div className={css['section-title']}>{t('token')}</div>

                <div className={css.apitoken}>
                    <div className={css.token}>{currentUserToken}</div>

                    <SettingsInformation
                        renderModalContent={() => (
                            <UploadStack
                                user={currentUser}
                                configurePythonCommand={config.CONFIGURE_PYTHON_COMMAND(currentUserToken, currentUser)}
                                configureRCommand={config.CONFIGURE_R_COMMAND(currentUserToken, currentUser)}
                                refresh={() => {}}
                                apiUrl={config.API_URL}
                            />
                        )}
                    />
                </div>

                <div className={css.reset}>
                    {t('generatingAnewTokenWillMakeThePreviousTokenInvalid')}
                    {' '}
                    <a onClick={createToken} href="/">{t('generateNewToken')}</a>
                </div>
            </div>
        </div>
    );
};

export default connect(
    state => ({
        userData: state.app.userData,
        currentUser: state.app.userData?.user,
        currentUserToken: state.app.userData?.token,
    }),
    {updateToken, updateSettings}
)(Account);