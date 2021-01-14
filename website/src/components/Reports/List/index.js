import React, {useState, useMemo, Fragment} from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory, useParams, Link} from 'react-router-dom';
import cn from 'classnames';
import useSWR from 'swr';
import {useAppStore} from 'AppStore';
import Yield from 'components/Yield';
import SearchField from 'components/SearchField';
import ListItem from '../ListItem';
import NotFound from 'components/NotFound';
import routes from 'routes';
import {dataFetcher, isSignedIn} from 'utils';
import config from 'config';
import Loader from './components/Loader';
import useActions from '../actions';
import css from './styles.module.css';

const dataFormat = data => data.dashboards;

const List = ({}) => {
    const [search, setSearch] = useState('');
    const [creating, setCreating] = useState(false);
    const [{currentUser, apiUrl}] = useAppStore();
    const currentUserName = currentUser.data?.user;
    const {createReport, deleteReport} = useActions();
    const {t} = useTranslation();
    const {user} = useParams();
    const {push} = useHistory();

    const {data, error, mutate} = useSWR(
        [
            apiUrl + config.DASHBOARD_LIST(user),
            dataFormat,
        ],
        dataFetcher,
    );

    const items = useMemo(() => {
        let items = [];

        if (data && data.length) {
            if (search.length)
                items = data.filter(i => i.title.indexOf(search) >= 0);
            else
                items = data;
        }

        return items;
    }, [data, search]);

    const onChangeSearch = value => setSearch(value);

    const create = async () => {
        setCreating(true);
        const data = await createReport(user);

        setCreating(false);
        push(routes.reportsDetails(user, data.dashboard.id));
    };

    const getDeleteFunc = id => async () => {
        await deleteReport(user, id);
        mutate(data.filter(r => r.id !== id));
    };

    if (error?.status === 404)
        return <NotFound>
            {t('theDashboardYouAreRookingForCouldNotBeFound')}
            {' '}
            {isSignedIn() && (
                <Fragment>
                    <Link to={routes.reportsDetails(currentUserName)}>
                        {t('goToMyDashboards')}
                    </Link>.
                </Fragment>
            )}
        </NotFound>;

    if (!data)
        return <Loader />;

    return (
        <div className={css.list}>
            <Yield name="header-yield">
                <SearchField
                    showEverything
                    isDark
                    className={css.search}
                    placeholder={t('findDashboard')}
                    size="small"
                    value={search}
                    onChange={onChangeSearch}
                />
            </Yield>

            <div className={css.title}>
                {currentUserName === user
                    ? t('myReports')
                    : t('reportsOf', {name: user})
                }

                {data && Boolean(data.length) && <span>{data.length}</span>}
            </div>

            {data && Boolean(data.length) && <SearchField
                placeholder={t('search')}
                className={css.mobileSearch}
                showEverything
                size="small"
                value={search}
                onChange={onChangeSearch}
            />}

            <div className={css.grid}>
                {currentUserName === user && (
                    <div
                        onClick={create}
                        className={cn(css.add, {disabled: creating})}
                    >
                        <div className={css.caption}>
                            <span className="mdi mdi-plus" />
                            {t('newReport')}
                        </div>
                    </div>
                )}

                {items.map((item, index) => (
                    <ListItem
                        key={index}
                        user={user}
                        data={item}
                        deleteItem={currentUserName === item.user && getDeleteFunc(item.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default List;
