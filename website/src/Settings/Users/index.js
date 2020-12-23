import React, {useState} from 'react';
import cn from 'classnames';
import {useTranslation} from 'react-i18next';
import useSWR from 'swr';
import {Button, Avatar, Dropdown, useAppStore} from '@dstackai/dstack-react';
import {dataFetcher} from '@dstackai/dstack-react/dist/utils';
import config from 'config';
import Edit from './Edit';
import actions from './actions';
import css from './styles.module.css';

const dataFormat = data => data.users;

const formModel = {
    name: '',
    email: '',
    role: '',
};

const Users = () => {
    const [showEdit, setShowEdit] = useState(false);
    const [editData, setEditData] = useState(formModel);
    const [, setLoading] = useState(false);
    const [{currentUser: {data: userData}}] = useAppStore();
    const {t} = useTranslation();
    const {} = actions();

    // console.log(loading, addUser);

    const closeEdit = () => {
        setShowEdit(false);
    };

    const addNew = () => {
        setEditData(formModel);
        setShowEdit(true);
    };

    const submit = async data => {
        setLoading(true);

        data.asd = 0;
        // const result = await addUser(data);

        // console.log(result);

        setLoading(false);
        setShowEdit(false);
    };

    const roleMap = {
        'admin': {title: t('admin')},
        'white': {title: t('readAndWrite')},
        'read': {title: t('readOnly')},
    };

    const {data} = useSWR([
        config.API_URL + config.ADMIN_USERS_LIST,
        dataFormat,
    ], dataFetcher);

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

                            <div className={cn(css.cell, css.access)}>
                                <Dropdown
                                    className={cn(css.dropdown)}

                                    items={[
                                        {
                                            title: t('admin'),
                                            onClick: () => {},
                                        },

                                        {
                                            title: t('readAndWrite'),
                                            onClick: () => {},
                                        },

                                        {
                                            title: t('readOnly'),
                                            onClick: () => {},
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
                                    >
                                        <span className="mdi mdi-pencil" />
                                    </Button>

                                    <Button
                                        className={css.control}
                                        color="secondary"
                                        size="small"
                                    >
                                        <span className="mdi mdi-delete" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>}
            </div>

            <Edit
                data={editData}
                isShow={showEdit}
                onClose={closeEdit}
                submit={submit}
            />
        </div>
    );
};

export default Users;