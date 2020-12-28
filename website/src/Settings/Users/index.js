import React, {useState} from 'react';
import cn from 'classnames';
import {useTranslation} from 'react-i18next';
import useSWR from 'swr';
import {Button, Avatar, Dropdown, useAppStore} from '@dstackai/dstack-react';
import {dataFetcher} from '@dstackai/dstack-react/dist/utils';
import config from 'config';
import Edit from './Edit';
import LinkModal from './LinkModal';
import actions from './actions';
import css from './styles.module.css';

const dataFormat = data => data.users;

const formModel = {
    name: '',
    email: '',
    role: '',
};

const getAuthLink = ({user, verification_code: code}) => {
    return `${window.origin}/auth/verify?user=${user}&code=${code}`;
};

const Users = () => {
    const [showEdit, setShowEdit] = useState(false);
    const [showLink, setShowLink] = useState(false);
    const [linkData, setLinkData] = useState(formModel);
    const [editData, setEditData] = useState(formModel);
    const [loading, setLoading] = useState(false);
    const [{currentUser: {data: userData}}] = useAppStore();
    const {t} = useTranslation();
    const {addUser, editUser, deleteUser, resetUserAuthCode} = actions();

    const {data, mutate} = useSWR([
        config.API_URL + config.ADMIN_USERS_LIST,
        dataFormat,
    ], dataFetcher);

    const closeEdit = () => {
        setShowEdit(false);
    };

    const closeLinkModal = () => {
        setShowLink(false);
    };

    const addNew = () => {
        setEditData(formModel);
        setShowEdit(true);
    };

    const submit = async submitData => {
        setLoading(true);

        if (submitData.token)
            editUser({
                name: submitData.name,
                email: submitData.email,
                role: submitData.role,
            })
                .then(response => {
                    setShowEdit(false);

                    const userIndex = data.findIndex(i => i.user === submitData.name);

                    if (userIndex >= 0)
                        data[userIndex] = {
                            ...data[userIndex],
                            ...response,
                        };

                    mutate([...data]);
                })
                .finally(() => setLoading(false));
        else
            addUser(submitData)
                .then(response => {
                    setShowEdit(false);
                    mutate([...data, response]);
                    setLinkData(response);
                    setShowLink(true);
                })
                .finally(() => setLoading(false));
    };

    const getSetUserRoleFunction = (user, role) => () => {
        editUser({
            name: user.user,
            email: user.email,
            role,
        })
            .then(response => {
                const userIndex = data.findIndex(i => i.user === user.name);

                if (userIndex >= 0)
                    data[userIndex] = {
                        ...data[userIndex],
                        ...response,
                    };

                mutate([...data]);
            });
    };

    const getDeleteUserFunction = name => () => {
        deleteUser({name})
            .then(() => {
                mutate(data.filter(i => i.user !== name));
            });
    };

    const getEditUserFunction = user => () => {
        setEditData({
            ...user,
            name: user.user,
        });

        setShowEdit(true);
    };

    const refreshAuthCode = userName => {
        resetUserAuthCode({name: userName})
            .then(response => {
                const userIndex = data.findIndex(i => i.user === userName);

                if (userIndex >= 0)
                    data[userIndex] = {
                        ...data[userIndex],
                        ...response,
                    };

                mutate([...data]);
                
                if (linkData)
                    setLinkData(data[userIndex]);
                
                if (editData) {
                    setEditData({
                        ...data[userIndex],
                        name: data[userIndex].user,
                    });
                }
            });
    };

    const roleMap = {
        'admin': {title: t('admin')},
        'write': {title: t('readAndWrite')},
        'read': {title: t('readOnly')},
    };

    return (
        <div className={css.users}>
            <div className={css.header}>
                <div className={css.note}>{t('hereAreTheUsersWhoHaveAnAccessToYourApplications')}:</div>

                <Button
                    className={css.button}
                    color="primary"
                    variant="contained"
                    size="small"
                    onClick={addNew}
                >{t('addUser')}</Button>
            </div>

            <div className={css.table}>
                <div className={css.head}>
                    <div className={css.row}>
                        <div className={css.cell}>
                            {t('name')}
                        </div>

                        <div className={css.cell}>
                            {t('emailAddress')}
                        </div>

                        <div className={css.cell}>
                            {t('access')}
                        </div>
                    </div>
                </div>

                {data && <div className={css.body}>
                    {data.map((item, index) => (
                        <div key={index} className={css.row}>
                            <div className={cn(css.cell, css.name)}>
                                <Avatar className={css.avatar} name={item.user} />
                                <span className={css.text}>{item.user}</span>

                                {item.user === userData?.user && (
                                    <span className={css.you}>{t('you')}</span>
                                )}
                            </div>

                            <div className={cn(css.cell, css.email)}>
                                <span className={css.text}>{item.email}</span>
                            </div>

                            {/*{item.role === 'admin' && (*/}
                            {/*    <div className={cn(css.cell, css.access)}>*/}
                            {/*        {roleMap[item.role]?.title}*/}
                            {/*    </div>*/}
                            {/*)}*/}

                            {/*{item.role !== 'admin' && (*/}
                            <div className={cn(css.cell, css.access)}>
                                <Dropdown
                                    className={cn(css.dropdown)}

                                    items={[
                                        {
                                            title: t('admin'),
                                            onClick: getSetUserRoleFunction(item, 'admin'),
                                        },

                                        {
                                            title: t('readAndWrite'),
                                            onClick: getSetUserRoleFunction(item, 'write'),
                                        },

                                        {
                                            title: t('readOnly'),
                                            onClick: getSetUserRoleFunction(item, 'read'),
                                        },
                                    ]}
                                >
                                    <Button
                                        className={css.dropdownButton}
                                        size="small"
                                    >
                                        {roleMap[item.role]?.title}
                                        <span className="mdi mdi-chevron-down" />
                                    </Button>
                                </Dropdown>

                                <div className={css.controls}>
                                    <Button
                                        className={css.control}
                                        color="secondary"
                                        size="small"
                                        onClick={getEditUserFunction(item)}
                                    >
                                        <span className="mdi mdi-pencil" />
                                    </Button>

                                    <Button
                                        className={css.control}
                                        color="secondary"
                                        size="small"
                                        onClick={getDeleteUserFunction(item.user)}
                                    >
                                        <span className="mdi mdi-delete" />
                                    </Button>
                                </div>
                            </div>
                            {/*)}*/}
                        </div>
                    ))}
                </div>}
            </div>

            <Edit
                data={editData}
                isShow={showEdit}
                onClose={closeEdit}
                submit={submit}
                loading={loading}
                getAuthLink={getAuthLink}
                refresh={() => refreshAuthCode(editData.user)}
            />

            <LinkModal
                onClose={closeLinkModal}
                isShow={showLink}
                link={linkData && getAuthLink(linkData)}
                refresh={() => refreshAuthCode(linkData.user)}
            />
        </div>
    );
};

export default Users;