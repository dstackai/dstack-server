// @flow

import React, {useEffect, useState, useRef, useMemo, Fragment} from 'react';
import cx from 'classnames';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import {useTranslation} from 'react-i18next';
import {Link, useParams} from 'react-router-dom';
import BackButton from 'components/BackButton';
import Dropdown from 'components/Dropdown';
import Button from 'components/Button';
import PermissionUsers from 'components/PermissionUsers';
import Markdown from 'components/stack/Markdown';
import Loader from 'components/stack/Details/components/Loader';
import Tabs from 'components/stack/Details/components/Tabs';
import Readme from 'components/stack/Details/components/Readme';
import RefreshMessage from 'components/stack/Details/components/RefreshMessage';
import FilterLoader from './components/Loader';
import Logs from './components/Logs';
import Progress from './components/Progress';
import Views, {VIEWS} from './components/Views';
import actions from '../actions';
import {parseStackTabs} from 'utils';
import {useAppStore} from 'AppStore';
import Avatar from 'components/Avatar';
import css from './styles.module.css';

import type {TView} from './components/Views/types';

const REFRESH_INTERVAL = 1000;

const STATUSES = Object.freeze({
    RUNNING: 'RUNNING',
    FINISHED: 'FINISHED',
    FAILED: 'FAILED',
});

type ExecuteData = {
    tqdm?: {
        desc?: string,
        n: number,
        total: number,
    }
}

type Props = {
    loading: boolean,
    attachmentIndex: number,
    data: {},
    backUrl: string,
    executionId: string,
    onChangeAttachmentIndex: Function,
    onChangeExecutionId: Function,
    onUpdateReadme: Function,
    toggleShare?: Function,

    updates: {
        has?: Boolean,
        refreshAction?: Function,
        cancelAction?: Function,
    }
}

const Details = ({
    executionId,
    onChangeExecutionId,
    attachmentIndex,
    onChangeAttachmentIndex,
    onUpdateReadme,
    toggleShare,
    data,
    loading,
    backUrl,
    updates,
}: Props) => {
    const {t} = useTranslation();
    const params = useParams();
    const didMountRef = useRef(false);
    const pollTimeoutRef = useRef(null);
    const [executeData, setExecuteData]:[?ExecuteData | {}, Function] = useState(null);
    const [executing, setExecuting] = useState(false);
    const [calculating, setCalculating] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState();
    const [tabs, setTabs] = useState([]);
    const {executeStack, pollStack} = actions();

    const [{currentUser}] = useAppStore();
    const currentUserName = currentUser.data?.user;

    const stackOwner = data?.user;
    const stackName = data?.name;
    const frameId = data?.head?.id;

    const withSidebar = useMemo(() => {
        return (executeData?.views || []).some(v => v.container === 'sidebar');
    }, [executeData]);

    const hasApplyButton = get(executeData, 'require_apply', false);

    const setActiveExecutionId = (value?: string) => {
        if (typeof onChangeExecutionId === 'function')
            onChangeExecutionId(value);

        if (tabs.length && activeTab)  {
            const tabIndex = tabs.findIndex(t => t.value === activeTab);

            if (tabIndex >= 0) {
                tabs[tabIndex].executionId = value;
                setTabs(tabs);
            }
        }
    };

    const updateExecuteData = data => {
        setExecuteData({
            lastUpdate: Date.now(),
            ...data,
        });
    };

    const submit = (views = [], apply = true, event) => {
        setExecuting(true);

        const params = {
            user: data.user,
            stack: data.name,
            frame: frameId,
            'previous_execution_id': executionId,
            attachment: attachmentIndex || 0,
            event,
            views: views.map(v => {
                if (v.type === VIEWS.OUTPUT)
                    delete v.data;

                return v;
            }),
        };

        if (apply && hasApplyButton) {
            params.event = {type: 'apply'};
        }

        executeStack(params)
            .then(data => {
                setExecuting(false);
                setError(null);
                updateExecuteData(data);
                setActiveExecutionId(data.id);

                if (data.status === STATUSES.RUNNING) {
                    setCalculating(true);
                    checkFinished({id: data.id, isUpdateData: apply});
                }
            })
            .catch(() => {
                setExecuting(false);
                setCalculating(false);
                setError({status: null});
            });
    };

    const getViewsAfterUpdate = (view: TView) => new Promise(resolve => {
        setExecuteData(prevState => {
            const newState = {
                ...prevState,
                lastUpdate: Date.now(),
                views: prevState.views.map(v => v.id !== view.id ? v : view),
            };

            resolve(newState.views);
            return newState;
        });
    });

    const onChangeView = (view: TView, event: {source: string, type: string}) => {
        getViewsAfterUpdate(view)
            .then((views: Array<TView>) => {
                if (!isEqual(executeData.views, views)) {
                    const hasNotRequiredApplyDepends =
                        views.filter(v => v.depends && v.depends.indexOf(view.id) >= 0)
                            .some(v => !v['require_apply']);

                    if (hasNotRequiredApplyDepends)
                        submit(views, !hasApplyButton, event);
                }
            });
    };

    const onApply = () => submit(executeData?.views);
    //
    // const onReset = () => {
    //     startExecute();
    // };

    const startExecute = () => {
        setExecuting(true);
        setExecuteData(null);

        executeStack({
            user: stackOwner,
            stack: stackName,
            frame: frameId,
            attachment: attachmentIndex || 0,
        })
            .then(data => {
                setExecuting(false);
                setError(null);
                updateExecuteData(data);
                setActiveExecutionId(data.id);

                setCalculating(data.status === STATUSES.RUNNING);

                if (data.status === STATUSES.RUNNING)
                    checkFinished({id: data.id, isUpdateData: true});

                if (data.status === STATUSES.FAILED) {
                    setExecuteData(prevState => ({
                        prevState,
                        logs: data.logs,
                        date: Date.now(),
                    }));

                    setError({status: data.status});
                }
            })
            .catch(e => {
                console.error(e);
                setExecuting(false);
                setError({status: null});
            });
    };

    useEffect(() => {
        if (stackOwner !== params.user || stackName !== params.stack)
            return;

        if (stackOwner && stackName && frameId && !loading) {
            if (!executionId) {
                startExecute();
            } else {
                setCalculating(true);
                checkFinished({id: executionId, isUpdateData: true});
            }
        }
    }, [stackOwner, stackName, frameId, attachmentIndex]);

    useEffect(() => {
        if (!didMountRef.current && frameId)
            parseTabs();
    }, [frameId]);

    useEffect(() => {
        if (!didMountRef.current)
            didMountRef.current = true;

        return () => {
            didMountRef.current = false;
        };
    }, []);

    const getCurrentAttachment = tabName => {
        const attachments = get(data, 'head.attachments');

        let attachment;

        if (tabName) {
            const tab = tabs.find(t => t.value === tabName);

            attachment = attachments.find(attach => {
                return (attach.params[tab.value]?.type === 'tab'
                    || attach.params[tab.key]?.title === tab.value
                );
            });
            
        } else if (attachmentIndex !== undefined) {
            if (attachments[attachmentIndex]) {
                attachment = attachments[attachmentIndex];
            }
        } else {
            attachment = attachments[0];
        }

        return attachment;
    };

    const parseTabs = () => {
        const attachments = get(data, 'head.attachments');

        if (!attachments || !attachments.length)
            return;

        const tabs = parseStackTabs(attachments);
        const attachment = getCurrentAttachment();

        setTabs(tabs);

        if (attachment) {
            const params = {...attachment.params};
            const tab = Object.keys(params).find(key => params[key]?.type === 'tab');

            setActiveTab((params[tab]?.title || tab || null));
        }
    };

    const onChangeTab = tabName => {
        setActiveTab(tabName);

        const attachments = get(data, 'head.attachments');
        const tab = tabs.find(t => t.value === tabName);

        if (!attachments)
            return;

        if (tabs.length) {
            attachments.some((attach, index) => {
                if (tab
                    && attach.params[tab.value]?.type !== 'tab'
                    && attach.params[tab.key]?.title !== tab.value
                )
                    return false;

                if (onChangeExecutionId)
                    onChangeExecutionId(tab.executionId);

                setExecuteData(null);
                onChangeAttachmentIndex(index);

                return true;
            });
        }
    };

    const checkFinished = ({id}) => {
        pollStack({id: id})
            .then(data => {
                setActiveExecutionId(data.id);

                setCalculating(data.status === STATUSES.RUNNING);

                if (data.status === STATUSES.RUNNING) {
                    setExecuteData(prevState => ({
                        ...prevState,
                        tqdm: data?.tqdm,
                    }));

                    if (didMountRef.current) {
                        if (pollTimeoutRef.current)
                            clearTimeout(pollTimeoutRef.current);

                        pollTimeoutRef.current = setTimeout(() => {
                            checkFinished({id: data.id});
                        }, REFRESH_INTERVAL);
                    }
                }

                if ([STATUSES.FINISHED, STATUSES.FAILED].indexOf(data.status) >= 0)
                    updateExecuteData(data);

                if (data.status === STATUSES.FAILED)
                    setError({status: data.status});
            });
    };

    if (loading)
        return <Loader />;

    const attachment = getCurrentAttachment(activeTab);

    return (
        <div className={cx(css.details)}>
            <BackButton
                className={css.backButton}
                Component={Link}
                to={backUrl}
            >{t('backToApplications')}</BackButton>

            <div className={css.header}>
                <div className={css.title}>
                    {data.name}
                    <span className={`mdi mdi-lock${data['access_level'] === 'private' ? '' : '-open'}`} />
                </div>

                {data['access_level'] === 'private' && (
                    <PermissionUsers
                        className={css.permissions}
                        permissions={data.permissions}
                    />
                )}

                {data.user !== currentUserName && (
                    <Avatar
                        withBorder
                        size="small"
                        className={css.owner}
                        name={data.user}
                    />
                )}

                <div className={css.sideHeader}>
                    {calculating && (
                        <Fragment>
                            <Progress
                                className={css.progress}

                                progress={executeData?.tqdm
                                    ? executeData.tqdm.n / executeData.tqdm.total * 100
                                    : undefined
                                }
                            />

                            {executeData?.tqdm?.desc && (
                                <div className={css.progressStatus}>
                                    {executeData?.tqdm?.desc}
                                    {' '}
                                    {executeData.tqdm.unit && (
                                        `${executeData.tqdm.n} / ${executeData.tqdm.total} ${executeData.tqdm.unit}`
                                    )}
                                </div>
                            )}
                        </Fragment>
                    )}

                    {hasApplyButton && (
                        <Button
                            className={css.run}
                            variant="contained"
                            color="primary"
                            size="small"
                            disabled={executing || calculating}
                            onClick={onApply}
                        >
                            {t('apply')}
                        </Button>
                    )}

                    {data && data.user === currentUserName && toggleShare && (
                        <Dropdown
                            className={css.dropdown}

                            items={[
                                {
                                    title: t('share'),
                                    value: 'share',
                                    onClick: toggleShare,
                                },
                            ]}
                        />
                    )}
                </div>
            </div>

            {updates.has && (
                <RefreshMessage
                    className={css.refreshMessage}
                    refresh={updates.refreshAction}
                    close={updates.cancelAction}
                />
            )}

            {Boolean(tabs.length) && <Tabs
                className={css.tabs}
                onChange={onChangeTab}
                value={activeTab}
                disabled={executing || calculating}
                items={tabs}
            />}

            {((!executeData?.views && !executeData?.logs) && (executing || calculating)) && (
                <div className={css.container}>
                    <FilterLoader className={css.filterLoader} />
                </div>
            )}

            {(executeData?.views || executeData?.logs) && (
                <div className={cx(css.container, {[css.withSidebar]: withSidebar})}>
                    {attachment?.description && (
                        <Markdown className={css.description}>
                            {attachment.description}
                        </Markdown>
                    )}

                    {Boolean(executeData?.views?.length) && (
                        <Views
                            className={css.sidebar}
                            container="sidebar"
                            onChange={onChangeView}
                            views={executeData?.views}
                            loading={calculating || executing}
                        />
                    )}

                    {Boolean(executeData?.views?.length) && (
                        <Views
                            className={css.views}
                            onChange={onChangeView}
                            views={executeData?.views}
                            loading={calculating || executing}
                        />
                    )}

                    {!calculating && !executing && error && (
                        <div className={css.error}>
                            <div className={css.message}>
                                <span className="mdi mdi-alert-circle-outline" /> {t('appStackError')}
                            </div>
                        </div>
                    )}

                    {executeData.logs && <Logs
                        className={css.logs}
                        logs={executeData.logs}
                        date={executeData.date}
                    />}
                </div>
            )}

            {data && (
                <Readme
                    className={css.readme}
                    data={data}
                    onUpdate={onUpdateReadme}
                />
            )}
        </div>
    );
};

export default Details;
