// @flow

import React from 'react';
import {Switch, Route, Redirect} from 'react-router-dom';
import {NavLink} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {Tabs, useAppStore} from '@dstackai/dstack-react';
import Account from './Account';
import Users from './Users';
import routes from 'routes';
import css from './styles.module.css';

type Props = {

}

const Settings = ({}: Props) => {
    const {t} = useTranslation();
    const [{currentUser: {data: userData}}] = useAppStore();

    return (
        <div className={css.settings}>
            <div className={css.title}>{t('settings')}</div>

            <Tabs
                className={css.tabs}
                tabComponent={NavLink}
                appearance="stroke-filled"
                tabs={[
                    {
                        label: t('account'),
                        to: routes.accountSettings(),
                        activeClassName: 'active',
                    },

                    ...(userData?.role === 'admin'
                        ? [{
                            label: t('user_plural'),
                            to: routes.usersSettings(),
                            activeClassName: 'active',
                        }]
                        : []
                    ),
                ]}
            />

            <div className={css.content}>
                <Switch>
                    <Redirect exact from={routes.settings()} to={routes.accountSettings()} />
                    <Route path={routes.accountSettings()} component={Account} />

                    {userData?.role === 'admin' && (
                        <Route path={routes.usersSettings()} component={Users} />
                    )}
                </Switch>
            </div>
        </div>
    );
};

export default Settings;
