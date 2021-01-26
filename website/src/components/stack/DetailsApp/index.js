// @flow

import React, {useEffect, useState, useRef} from 'react';
import cx from 'classnames';
import {isEqual, get} from 'lodash-es';
import {useDebounce} from 'react-use';
import moment from 'moment';
import {useTranslation} from 'react-i18next';
import {Link, useParams} from 'react-router-dom';
import Button from 'components/Button';
import BackButton from 'components/BackButton';
import Share from 'components/Share';
import PermissionUsers from 'components/PermissionUsers';
import StackFilters from 'components/StackFilters';
import Markdown from 'components/stack/Markdown';
import StackAttachment from 'components/stack/Attachment';
import Loader from 'components/stack/Details/components/Loader';
import Tabs from 'components/stack/Details/components/Tabs';
import Readme from 'components/stack/Details/components/Readme';
import Progress from './components/Progress';
import FilterLoader from './components/Loader';
import actions from '../actions';
import useForm from 'hooks/useForm';
import {parseStackTabs, parseStackViews} from 'utils';
import {useAppStore} from 'AppStore';
import Avatar from 'components/Avatar';
import css from './styles.module.css';

const REFRESH_INTERVAL = 1000;

const STATUSES = Object.freeze({
    READY: 'READY',
    SCHEDULED: 'SCHEDULED',
    RUNNING: 'RUNNING',
    FINISHED: 'FINISHED',
    FAILED: 'FAILED',
});

type Props = {
    loading: boolean,
    currentFrameId: number,
    attachmentIndex: number,
    frame: ?{},
    data: {},
    backUrl: string,
    user: string,
    stack: string,
    headId: number,
    executionId: string,
    onChangeHeadFrame: Function,
    onChangeAttachmentIndex: Function,
    onChangeExecutionId: Function,
    onUpdateReadme: Function,
    onChangeFrame: Function,
    changeAccessLevel: Function,
    updatePermissions: Function,
}

const Details = ({
    executionId,
    onChangeExecutionId,
    attachmentIndex,
    onChangeAttachmentIndex,
    onUpdateReadme,
    data,
    frame,
    loading,
    backUrl,
    user,
    stack,
    changeAccessLevel,
    updatePermissions,
}: Props) => {
    const {t} = useTranslation();
    const params = useParams();
    const didMountRef = useRef(false);
    const pollTimeoutRef = useRef(null);
    const {form, setForm, onChange} = useForm({});
    const [fields, setFields] = useState({});
    const [logsExpand, setExpandLogs] = useState(false);
    const [executeData, setExecuteData] = useState(null);
    const [executing, setExecuting] = useState(false);
    const [calculating, setCalculating] = useState(false);
    const [error, setError] = useState(null);
    const [appAttachments, setAppAttachment] = useState(null);
    const [isScheduled, setIsScheduled] = useState(false);
    const [activeTab, setActiveTab] = useState();
    const [tabs, setTabs] = useState([]);
    const {executeStack, pollStack} = actions();

    const [{currentUser}] = useAppStore();
    const currentUserName = currentUser.data?.user;

    const stackOwner = data?.user;
    const stackName = data?.name;
    const frameId = data?.head?.id;

    const getFormFromViews = views => {
        if (!views || !Array.isArray(views))
            return {};

        return views.reduce((result, view, index) => {
            switch (view.type) {
                case 'ApplyView':
                    return result;
                case 'SliderView':
                    result[index] = view.data[view.selected];
                    break;
                case 'ComboBoxView':
                    result[index] = view.selected;
                    break;
                case 'CheckBoxView':
                    result[index] = view.selected;
                    break;
                default:
                    result[index] = view.data;
            }

            return result;
        }, {});
    };

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
        const fields = parseStackViews(data?.views);
        const form = getFormFromViews(data?.views);

        setFields(fields);
        setForm(form);

        setExecuteData({
            lastUpdate: Date.now(),
            ...data,
        });
    };

    const hasApplyButton = () => {
        if (!executeData?.views || !Array.isArray(executeData.views))
            return false;

        return executeData.views.some(view => view.type === 'ApplyView');
    };

    const submit = (form, apply = true) => {
        setExecuting(true);

        if (apply)
            setCalculating(true);

        executeStack({
            user: data.user,
            stack: data.name,
            frame: frameId,
            attachment: attachmentIndex || 0,
            apply,
            views: executeData.views && executeData.views.map((view, index) => {
                switch (view.type) {
                    case 'ApplyView':
                        return view;
                    case 'CheckBoxView':
                        view.selected = form[index];
                        break;
                    case 'ComboBoxView':
                        view.selected = form[index];
                        break;
                    case 'SliderView':
                        view.selected = view.data.findIndex(i => i === form[index]);
                        break;
                    default:
                        view.data = form[index];
                }

                return view;
            }),
        })
            .then(data => {
                setExecuting(false);
                setError(null);
                updateExecuteData(data);
                setActiveExecutionId(data.id);

                if (apply && data.status !== STATUSES.SCHEDULED) {
                    checkFinished({id: data.id, isUpdateData: apply});
                }

                if (data.status === STATUSES.SCHEDULED) {
                    setIsScheduled(true);
                    checkFinished({id: data.id, isUpdateData: true});
                }
            })
            .catch(() => {
                setExecuting(false);
                setCalculating(false);
                setError({status: null});
            });
    };

    useDebounce(() => {
        if (!isEqual(form, getFormFromViews(executeData?.views)) && !executing) {
            submit(form, !!(!hasApplyButton() && appAttachments));
        }
    }, 300, [form]);

    const onApply = () => submit(form);

    const onReset = () => startExecute();

    useEffect(() => {
        if (executeData && executeData.status === STATUSES.READY && !appAttachments && !executing) {
            if (!hasApplyButton())
                submit(form, true);
        }
    }, [executeData]);

    const startExecute = () => {
        setExecuting(true);
        setExecuteData(null);
        setAppAttachment(null);

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

                if (data.status === STATUSES.SCHEDULED) {
                    setIsScheduled(true);
                    checkFinished({id: data.id, isUpdateData: true});
                }
            })
            .catch(() => {
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
                setExecuting(true);
                setCalculating(true);
                setAppAttachment(null);
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

    const checkFinished = ({id, isUpdateData}) => {
        pollStack({id: id})
            .then(data => {
                setIsScheduled(data.status === STATUSES.SCHEDULED);
                setActiveExecutionId(data.id);

                if ([STATUSES.SCHEDULED, STATUSES.RUNNING].indexOf(data.status) >= 0)
                    if (didMountRef.current) {
                        if (pollTimeoutRef.current)
                            clearTimeout(pollTimeoutRef.current);

                        pollTimeoutRef.current = setTimeout(() => {
                            checkFinished({id: data.id, isUpdateData});
                        }, REFRESH_INTERVAL);
                    }

                if (
                    [
                        STATUSES.FINISHED,
                        STATUSES.FAILED,
                        STATUSES.READY,
                    ].indexOf(data.status) >= 0
                ) {
                    setCalculating(false);
                }

                if ([STATUSES.FINISHED, STATUSES.READY].indexOf(data.status) >= 0) {
                    if (data.outputs)
                        setAppAttachment(data.outputs);

                    if (isUpdateData) {
                        setExecuting(false);
                        updateExecuteData(data);
                    } else {
                        setExecuteData({
                            ...executeData,
                            logs: data.logs,
                            date: Date.now(),
                        });
                    }
                }

                if (data.status === STATUSES.FAILED) {
                    if (isUpdateData) {
                        setExecuting(false);
                        updateExecuteData(data);
                    } else {
                        setExecuteData({
                            ...executeData,
                            logs: data.logs,
                            date: Date.now(),
                        });
                    }

                    setError({status: data.status});
                }
            });
    };

    if (loading)
        return <Loader />;

    const withSidebar = Object.keys(fields).some((key, index) => {
        if (fields[key].type === 'textarea')
            return true;

        return index >= 3;
    });

    const attachment = getCurrentAttachment(activeTab);

    return (
        <div className={cx(css.details)}>
            <div className={css.header}>
                <BackButton
                    className={css.backButton}
                    Component={Link}
                    to={backUrl}
                />

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
                    {data && data.user === currentUserName && (
                        <Share
                            instancePath={`${user}/${stack}`}
                            stackName={stack}
                            onChangeAccessLevel={changeAccessLevel}
                            className={css.share}
                            accessLevel={data['access_level']}
                            defaultPermissions={data.permissions}

                            urlParams={{
                                a: attachmentIndex ? attachmentIndex : null,
                                f: frameId !== data?.head?.id ? frame?.id : null,
                                'execution_id': executionId,
                            }}

                            onUpdatePermissions={
                                permissions => updatePermissions(`${user}/${stack}`, permissions)
                            }
                        />
                    )}
                </div>
            </div>

            {Boolean(tabs.length) && <Tabs
                className={css.tabs}
                onChange={onChangeTab}
                value={activeTab}
                disabled={executing || calculating}
                items={tabs}
            />}

            {(!executeData && executing) && <div className={css.container}>
                <FilterLoader className={css.filterLoader} />
            </div>}

            {executeData && (
                <div className={cx(css.container, {[css.withSidebar]: withSidebar})}>
                    {attachment?.description && (
                        <Markdown className={css.description}>
                            {attachment.description}
                        </Markdown>
                    )}

                    <StackFilters
                        fields={fields}
                        form={form}
                        onChange={onChange}
                        onApply={onApply}
                        onReset={onReset}
                        className={css.filters}
                        isSidebar={withSidebar}
                        disabled={executing || calculating}
                    />

                    {appAttachments && appAttachments.length && !calculating && (
                        <div className={css.attachmentsGrid}>
                            {
                                appAttachments.map(attach => (
                                    <StackAttachment
                                        className={cx(css.attachment, {noOne: appAttachments.length > 1})}
                                        stack={`${user}/${stack}`}
                                        customData={attach}
                                    />
                                ))
                            }
                        </div>
                    )}

                    {calculating && !isScheduled && (
                        <Progress
                            className={css.progress}
                            message={t('calculatingTheData')}
                        />
                    )}

                    {!appAttachments && !error && isScheduled && (
                        <Progress
                            className={css.progress}
                            message={t('initializingTheApplication')}
                        />
                    )}

                    {!calculating && !executing && !appAttachments && !error && !isScheduled && (
                        <div className={css.emptyMessage}>
                            {t('clickApplyToSeeTheResult')}
                        </div>
                    )}

                    {!calculating && !executing && error && (
                        <div className={css.error}>
                            <div className={css.message}>
                                <span className="mdi mdi-alert-circle-outline" /> {t('appStackError')}
                            </div>
                        </div>
                    )}

                    {executeData.logs && (
                        <div className={css.logs}>
                            <Button
                                className={css.logsButton}
                                color="primary"
                                onClick={() => setExpandLogs(value => !value)}
                                size="small"
                            >
                                {t('logs')}
                                <span className={`mdi mdi-arrow-${logsExpand ? 'collapse' : 'expand'}`} />
                            </Button>

                            <div className={cx(css.logsExpand, {open: logsExpand})}>
                                <div className={css.fromAgo}>{t('updated')} {moment(executeData.date).fromNow()}</div>

                                <div className={css.log}>
                                    {executeData.logs}
                                </div>
                            </div>
                        </div>
                    )}
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
