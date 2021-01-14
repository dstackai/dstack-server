import React, {Fragment, useEffect, useContext, useState, useRef} from 'react';
import useSWR from 'swr';
import cn from 'classnames';
import {get, isEqual} from 'lodash-es';
import {Link, useHistory, useParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import NotFound from 'components/NotFound';
import AccessForbidden from 'components/AccessForbidden';
import {useAppStore} from 'AppStore';
import config from 'config';
import routes from 'routes';
import {dataFetcher, isSignedIn, parseStackParams, parseStackTabs} from 'utils';
import {useDebounce, useForm} from 'hooks';
import Loader from './components/Loader';
import Yield from 'components/Yield';
import PermissionUsers from 'components/PermissionUsers';
import BackButton from 'components/BackButton';
import StretchTitleField from 'components/StretchTitleField';
import Share from 'components/Share';
import Dropdown from 'components/Dropdown';
import Button from 'components/Button';
import DnDGridContext from 'components/dnd/DnDGridContext';
import usePrevious from 'hooks/usePrevious';
import StackFilters from 'components/StackFilters';
import useActions from '../actions';
import AddStacksModal from '../AddStacksModal';
import Card from './components/Card';
import StackTabs from 'components/stack/Details/components/Tabs';
import DnDItem from 'components/dnd/DnDItem';
import StretchTextareaField from 'components/StretchTextareaField';
import css from './styles.module.css';

const dataFormat = data => data.dashboard;

const Details = () => {
    const {t} = useTranslation();
    const {user, id} = useParams();
    const {push} = useHistory();
    const {items, moveItem, setItems} = useContext(DnDGridContext);
    const [{currentUser, apiUrl}] = useAppStore();
    const currentUserName = currentUser.data?.user;
    const {deleteReport, updateReport, reportInsertCard, reportDeleteCard, reportUpdateCard} = useActions();
    const descFieldRef = useRef();
    const isMounted = useRef(false);
    const [isShowStacksModal, setIsShowStacksModal] = useState(false);
    const [activeTab, setActiveTab] = useState();
    const [tabs, setTabs] = useState([]);
    const {form, setForm, onChange} = useForm({});
    const [fields, setFields] = useState({});
    const [filteredCards, setFilteredCards] = useState([]);
    const setGridItems = cardsItems => setItems(cardsItems.map(card => ({id: card.index, card})));

    const {data, mutate, error} = useSWR(
        [
            apiUrl + config.DASHBOARD_DETAILS(user, id),
            dataFormat,
        ],
        dataFetcher,

        {revalidateOnFocus: false}
    );

    const [isShowDesc, setIsShowDesc] = useState(Boolean(data?.description?.length));
    const prevIsShowDesc = usePrevious(isShowDesc);

    const prevData = usePrevious(data);

    useEffect(() => {
        if (!isEqual(prevData?.cards, data?.cards) || (data?.cards && !isMounted.current)) {
            parseTabs();
        }

        if (prevData?.description !== data?.description)
            setIsShowDesc(Boolean(data?.description?.length));
    }, [data]);

    useEffect(() => {
        return () => {
            setGridItems([]);
        };
    }, []);

    useEffect(() => {
        if (filteredCards.length) {
            setGridItems(filteredCards);
            parseParams();
        }
    }, [filteredCards]);

    useEffect(() => {
        if (activeTab !== undefined)
            filterCards();
    }, [activeTab]);

    useEffect(() => {
        if (isMounted.current
            && prevIsShowDesc !== isShowDesc
            && descFieldRef.current && !data.description?.length)
            descFieldRef.current.focus();
    }, [isShowDesc]);

    useEffect(() => {
        isMounted.current = true;
    }, []);

    const getAllAttachments = cards => {
        if (!cards)
            cards = data?.cards;

        if (!cards?.length)
            return [];

        return cards.reduce((result, card) => {
            return result.concat(get(card, 'head.attachments', []));
        }, []);
    };

    const parseParams = () => {
        const fields = parseStackParams(getAllAttachments(filteredCards)) || {};

        const defaultFilterValues = Object.keys(fields).reduce((result, fieldName) => {
            if (fields[fieldName].type === 'select')
                result[fieldName] = fields[fieldName].options[0].value;

            if (fields[fieldName].type === 'slider') {
                const key = Object.keys(fields[fieldName].options)[0];

                result[fieldName] = fields[fieldName].options[key];
            }

            if (fields[fieldName].type === 'checkbox')
                result[fieldName] = false;

            return result;
        }, {});

        setForm(defaultFilterValues);
        setFields(fields);
    };

    const parseTabs = () => {
        const attachments = getAllAttachments();

        if (!attachments || !attachments.length)
            return;

        const tabs = parseStackTabs(attachments);
        const hasOldTab = tabs.some(t => activeTab && t.value === activeTab);

        const newActiveTab = hasOldTab ? activeTab : (tabs[0]?.value || null);


        setTabs(tabs);
        setActiveTab(newActiveTab);

        if (newActiveTab === activeTab)
            filterCards();
    };

    const filterCards = () => {
        if (tabs.length && activeTab) {
            const filteredCards = data.cards.filter(card => {
                const attachments = get(card, 'head.attachments', []);

                if (!attachments || !attachments.length)
                    return true;

                const tabs = parseStackTabs(attachments);
                const tab = tabs.find(t => t.value === activeTab);

                if (!tabs.length)
                    return true;

                return attachments.some(attach => {
                    return (tab
                        && (
                            attach.params[tab.value]?.type === 'tab'
                            || attach.params[tab.key]?.title === tab.value
                        )
                    );
                });
            });

            setFilteredCards(filteredCards);
        } else {
            setFilteredCards(data.cards);
        }
    };

    const onChangeTab = tabName => {
        setActiveTab(tabName);
    };

    const update = async (params: {}) => {
        await updateReport(user, id, params);
    };

    const debounceUpdateTitle = useDebounce(async fields => {
        await update(fields);
    }, 300);

    const onChangeTitle = title => {
        data.title = title;
        mutate(data, false);
        debounceUpdateTitle({title});
    };

    const debounceUpdateDescription = useDebounce(async fields => {
        await update(fields);
    }, 300);


    const onChangeDescription = description => {
        data.description = description;
        mutate(data, false);
        debounceUpdateDescription({description});
    };

    const onChangePrivate = async isPrivate => {
        update({private: isPrivate})
            .then(() => {
                mutate({
                    ...data,
                    private: isPrivate,
                }, false);
            });
    };

    const addStacks = async stacks => {
        const {dashboard: {cards}} = await reportInsertCard(
            user,
            id,
            stacks.map(stack => ({stack})),
            data?.cards?.length
        );

        const newCards = cards.filter(c => stacks.indexOf(c.stack) >= 0);

        mutate({
            ...data,
            cards: data.cards.concat(newCards),
        }, false);
    };

    const getDeleteCardFunc = stack => async () => {
        await reportDeleteCard(
            user,
            id,
            stack,
        );

        mutate({
            ...data,
            cards: data.cards.filter(c => c.stack !== stack),
        }, false);
    };

    const updatePermissions = permissions => {
        mutate({
            ...data,
            permissions,
        }, false);
    };

    const getUpdatedCardFunc = stack => async fields => {
        const {cards: newCards} = await reportUpdateCard(
            user,
            id,
            stack,
            fields
        );

        const updatedCard = newCards.find(i => i.stack === stack);

        const index = data.cards.findIndex(i => i.stack === stack);

        if (index >= 0)
            Object.keys(fields).forEach(key => {
                data.cards[index][key] = updatedCard[key];
            });

        mutate({...data}, false);
    };

    const moveCard = (indexFrom, indexTo) => {
        if (indexTo < 0 || indexFrom < 0)
            return;

        const {stack} = items[indexFrom].card;

        moveItem(indexFrom, indexTo);

        reportUpdateCard(
            user,
            id,
            stack,
            {index: indexTo}
        ).catch(console.log);
    };

    const deleteDashboard = async () => {
        await deleteReport(user, id);
        push(routes.reports(user));
    };

    const renderFilters = () => {
        if (!Object.keys(fields).length)
            return null;

        const hasSelectField = Object.keys(fields).some(key => fields[key].type === 'select');

        return (
            <StackFilters
                fields={fields}
                form={form}
                onChange={onChange}
                className={cn(css.filters, {'with-select': hasSelectField})}
            />
        );
    };

    const toggleAddStackModal = event => {
        if (event?.target)
            event.preventDefault();

        setIsShowStacksModal(isShow => !isShow);
    };

    const onBlurDescription = () => {
        if (!data.description?.length)
            setIsShowDesc(false);
    };

    const addDesc = () => setIsShowDesc(true);

    if (error?.status === 403)
        return <AccessForbidden>
            {t('youDontHaveAnAccessToThisDashboard')}.

            {isSignedIn() && (
                <Fragment>
                    <br />

                    <Link to={routes.reports(currentUserName)}>
                        {t('goToMyDashboards')}
                    </Link>
                </Fragment>
            )}
        </AccessForbidden>;

    if (error?.status === 404)
        return <NotFound>
            {t('theDashboardYouAreRookingForCouldNotBeFound')}
            {' '}
            {isSignedIn() && (
                <Fragment>
                    <Link to={routes.reports(currentUserName)}>
                        {t('goToMyDashboards')}
                    </Link>.
                </Fragment>
            )}
        </NotFound>;

    if (!data)
        return <Loader />;

    const isUserOwner = currentUserName === user;
    const CardWrapComponent = isUserOwner ? DnDItem : Fragment;

    return (
        <div className={css.details}>
            <Yield name="header-yield">
                <BackButton
                    Component={Link}
                    to={routes.reports(user)}
                >
                    {(currentUserName === user)
                        ? t('backToDashboards')
                        : t('backToDashboardsOf', {name: user})
                    }
                </BackButton>
            </Yield>

            <div className={css.header}>
                <div className={css.title}>
                    <StretchTitleField
                        className={css.edit}
                        value={data.title || ''}
                        onChange={onChangeTitle}
                        readOnly={currentUserName !== data.user}
                        placeholder={t('newDashboard')}
                    />

                    <span className={`mdi mdi-lock${data.private ? '' : '-open'}`} />
                </div>

                {data.private && (
                    <PermissionUsers
                        className={css.permissions}
                        permissions={data.permissions}
                    />
                )}

                <div className={css.sideHeader}>
                    {isUserOwner && (
                        <a
                            className={css.addButton}
                            onClick={toggleAddStackModal}
                            href="#"
                        >
                            <span className="mdi mdi-plus" />
                            {t('addStack')}
                        </a>
                    )}

                    {isUserOwner && (
                        <Share
                            instancePath={`${user}/d/${data.id}`}
                            onChangeAccessLevel={onChangePrivate}
                            className={css.share}
                            defaultIsPrivate={data.private}
                            defaultPermissions={data.permissions}
                            onUpdatePermissions={updatePermissions}
                        />
                    )}

                    {isUserOwner && (
                        <Dropdown
                            className={css.dropdown}

                            items={[
                                {
                                    title: t('delete'),
                                    onClick: deleteDashboard,
                                },
                            ]}
                        >
                            <Button
                                className={css['dropdown-button']}
                                color="secondary"
                            >
                                <span className="mdi mdi-dots-horizontal" />
                            </Button>
                        </Dropdown>
                    )}
                </div>
            </div>

            <div className={css.description}>
                {isShowDesc && <StretchTextareaField
                    value={data.description || ''}
                    ref={descFieldRef}
                    placeholder={t('description')}
                    onChange={onChangeDescription}
                    onBlur={onBlurDescription}
                    readOnly={currentUserName !== data.user}
                />}

                {!isShowDesc && currentUserName === data.user && <Button
                    className={css.addDesc}
                    color="secondary"
                    onClick={addDesc}
                >
                    + {t('addDescription')}
                </Button>}
            </div>

            {Boolean(tabs.length) && <StackTabs
                className={css.tabs}
                onChange={onChangeTab}
                value={activeTab}
                items={tabs}
            />}

            {Boolean(items.length) && (
                <div className={css.container}>
                    <div className={css.section}>
                        <div className={css.fields}>
                            {renderFilters()}
                        </div>
                    </div>

                    <div className={cn(css.cards)}>
                        {items.map(item => (
                            <CardWrapComponent
                                key={item.card.stack}
                                {...(isUserOwner ? {
                                    id: item.id,
                                    onMoveItem: moveCard,
                                } : {})}
                            >
                                <Card
                                    activeTab={activeTab}
                                    filters={form}
                                    deleteCard={isUserOwner && getDeleteCardFunc(item.card.stack)}
                                    data={item.card}
                                    updateCard={isUserOwner && getUpdatedCardFunc(item.card.stack)}
                                    moveAvailable={isUserOwner}
                                />
                            </CardWrapComponent>
                        ))}
                    </div>
                </div>
            )}

            {!items.length && !data?.cards && (
                <div className={css.empty}>
                    {t('thereAreNoStacksYet')} <br/>
                    {t('youCanSendStacksYouWantToBeHereLaterOrAddItRightNow')}

                    {isUserOwner && (
                        <Fragment>
                            {' '}

                            <a
                                className={css.addButton}
                                onClick={toggleAddStackModal}
                                href="#"
                            >{t('addStack')}</a>.
                        </Fragment>
                    )}
                </div>
            )}

            <AddStacksModal
                isShow={isShowStacksModal}
                onClose={toggleAddStackModal}
                onAddStacks={addStacks}
            />
        </div>
    );
};

export default Details;
