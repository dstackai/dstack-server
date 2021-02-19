// @flow
import React, {useState, useEffect, Fragment, useMemo} from 'react';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import {useTranslation} from 'react-i18next';
import cx from 'classnames';
import useDebounce from 'hooks/useDebounce';
import Copy from 'components/Copy';
import Modal from 'components/Modal';
import Avatar from 'components/Avatar';
import Dropdown from 'components/Dropdown';
import TextField from 'components/TextField';
import Button from 'components/Button';
import {isValidEmail} from 'utils/validations';
import {useAppStore} from 'AppStore';
import useActions from './actions';
import css from './styles.module.css';

type Props = {
    className?: string,
    urlParams?: {[key: string]: any},
    update: Function,
    onChangeAccessLevel: Function,
    onUpdatePermissions: Function,
    permissions: Array<{}>,
    instancePath: string,
    loading: boolean,
    accessLevel: 'private' | 'public' | 'internal',
    defaultPermissions?: Array<{}>,
    stackName?: string,
};

const Share = ({
    className,
    instancePath,
    accessLevel: initialAccessLevel,
    defaultPermissions = [],
    onChangeAccessLevel,
    urlParams = {},
    onUpdatePermissions,
    stackName,
}: Props) => {
    const [{configInfo}] = useAppStore();
    const [userExists, setUserExists] = useState(null);
    const [isEmail, setIsEmail] = useState(false);
    const [accessLevel, setAccessLevel] = useState(initialAccessLevel);
    const [permissions, setPermissions] = useState(defaultPermissions);
    const [loading, setLoading] = useState(false);
    const [isShowModal, setIsShowModal] = useState(false);
    const [userName, setUserName] = useState('');
    const {checkUser, addPermissions, removePermissions} = useActions();
    const {t} = useTranslation();
    const toggleModal = () => setIsShowModal(!isShowModal);

    const dropdownOptionsMap = {
        public: t('public'),
        internal: t('forDstackaiUsersOnly'),
        private: t('forSelectedUsers'),
    };

    useEffect(() => {
        setPermissions(defaultPermissions);
        setAccessLevel(initialAccessLevel);
    }, [instancePath]);

    const checkUserName = useDebounce(userName => {
        setUserExists(null);

        if (userName.length) {
            checkUser(userName)
                .then(data => setUserExists(data.exists))
                .catch(() => setUserExists(null));
        }
    }, []);

    const onChangeDropdown = value => {
        setAccessLevel(value);
        onChangeAccessLevel(value);
    };

    const onChangeUserName = event => {
        setUserName(event.target.value);

        if (isValidEmail(event.target.value).isValid && get(configInfo, 'data.email_enabled')) {
            setUserExists(null);
            setIsEmail(true);
        } else {
            checkUserName(event.target.value);

            if (isEmail)
                setIsEmail(false);
        }
    };

    const submitInvite = () => {
        if (userName.length) {
            const userHasPermission = permissions.some(i => i.user === userName);

            if (!userHasPermission)
                addUser(userName);
            else {
                setUserName('');
                setUserExists(null);
                setIsEmail(false);
            }
        }
    };

    const onKeyPressUserName = event => {
        if (event.which === 13 || event.keyCode === 13 || event.key === 'Enter') {
            submitInvite();
        }
    };

    const addUser = (userName: string) => {
        setLoading(true);

        addPermissions({
            userName,
            instancePath,
        })
            .then(data => {
                setUserName('');
                setPermissions(permissions => {
                    const newPermissions = permissions.concat([data]);

                    onUpdatePermissions(newPermissions);
                    return newPermissions;
                });
            })
            .finally(() => setLoading(false));
    };

    const removeUser = (user: {
        user?: string,
        email?: string,
    }) => () => {
        removePermissions({
            instancePath,
            user,
        })
            .then(() => {
                setPermissions(permissions => {
                    const newPermissions = permissions.filter(i => !isEqual(i, user));

                    onUpdatePermissions(newPermissions);
                    return newPermissions;
                });
            });
    };

    const renderUser = (user, index) => {
        return (
            <div className={cx(css.user, {disabled: !user.user})} key={index}>
                <Avatar
                    className={css.userPic}
                    name={user.user || user.email}
                />

                <div className={css.userName}>{user.user || user.email}</div>

                <span
                    onClick={removeUser(user)}
                    className={cx(css.userDelete, 'mdi mdi-close')}
                />

                {user.user && (
                    <span className={cx(css.userMessage, css.userMessageSuccess)}>{t('done')}</span>
                )}

                {user.email && (
                    <span className={css.userMessage}>{t('waitingForAcceptance')}</span>
                )}
            </div>
        );
    };

    const searchString = useMemo(() => {
        const searchString = Object
            .keys(urlParams)
            .reduce((result, key) => {
                if (urlParams[key])
                    result.push(`${key}=${urlParams[key]}`);

                return result;
            }, [])
            .join('&');

        if (searchString)
            return `?${searchString}`;
    }, [urlParams]);

    const {origin} = window.location;

    return (
        <Fragment>
            <Button
                className={cx(css.desktopButton, className)}
                color="primary"
                size="small"
                variant="contained"
                onClick={toggleModal}
            >
                {t('share')}
            </Button>

            <Button
                className={cx(css.mobileButton, className)}
                color="primary"
                size="small"
                onClick={toggleModal}
            >
                <span className="mdi mdi-share-variant" />
            </Button>

            {instancePath && <Modal
                isShow={isShowModal}
                onClose={toggleModal}
                size="small"
                title={t('shareStack')}
                className={css.modal}
                dialogClassName={css.dialog}
                withCloseButton
            >
                <div className={css.description}>
                    {accessLevel === 'private'
                        && t('theStackNameIsPrivateButYouCanMakeShareItWithSelectedUsers', {name: stackName})
                    }

                    {accessLevel === 'public' && t('theStackNameIsPublic', {name: stackName})}
                    {accessLevel === 'internal' && t('theStackNameIsInternal', {name: stackName})}
                </div>

                <div className={css.copyAndDropdown}>
                    <div className={css.link}>{`${origin}/${instancePath}${searchString}`}</div>

                    <Copy
                        className={css.copy}
                        buttonTitle={null}
                        copyText={`${origin}/${instancePath}${searchString}`}
                        successMessage={t('linkIsCopied')}
                    />

                    <div className={css.separator} />

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
                            {dropdownOptionsMap[accessLevel]}
                            <span className="mdi mdi-chevron-down" />
                        </Button>
                    </Dropdown>
                </div>

                <div className={css.content}>
                    {accessLevel === 'private' && (
                        <div className={css.invite}>
                            <div className={css.checkUserName}>
                                <TextField
                                    size="small"
                                    disabled={loading}
                                    placeholder={get(configInfo, 'data.email_enabled')
                                        ? t('enterUsernameEmailAndPressEnter')
                                        : t('enterUsernameAndPressEnter')
                                    }
                                    className={css.inviteField}
                                    value={userName}
                                    onChange={onChangeUserName}
                                    onKeyPress={onKeyPressUserName}
                                />

                                {Boolean(userName.length) && !loading && <div
                                    className={cx(css.checkUserMessage, {
                                        success: userExists,
                                        fail: userExists === false,
                                        secondary: isEmail,
                                    })}
                                >
                                    {userExists && !isEmail && t('userExists')}
                                    {!userExists && !isEmail && t('userNotFound')}
                                    {isEmail && t('enterToInvite')}
                                </div>}
                            </div>

                            <Button
                                className={css.inviteButton}
                                size="small"
                                color="primary"
                                variant="contained"
                                disabled={loading || (!isEmail && !userExists)}
                                onClick={submitInvite}
                            >{t('sendInvite')}</Button>
                        </div>
                    )}

                    {accessLevel === 'private' && <div className={css.users}>
                        {permissions.map(renderUser)}
                    </div>}
                </div>
            </Modal>}
        </Fragment>
    );
};

export default Share;
