// @flow

import React, {useEffect, useState, useRef} from 'react';
import cx from 'classnames';
import {isEqual, get} from 'lodash-es';
import {useDebounce} from 'react-use';
import usePrevious from '../../hooks/usePrevious';
import moment from 'moment';
import {useTranslation} from 'react-i18next';
import {Link} from 'react-router-dom';
import Yield from '../../Yield';
import Button from '../../Button';
import BackButton from '../../BackButton';
import Share from '../../Share';
import PermissionUsers from '../../PermissionUsers';
import StackFilters from '../../StackFilters';
import StackAttachment from '../Attachment';
import StackFrames from '../Frames';
import Loader from '../Details/components/Loader';
import FilterLoader from './components/Loader';
import Tabs from '../Details/components/Tabs';
import Readme from '../Details/components/Readme';
import Progress from './components/Progress';
import useForm from '../../hooks/useForm';
import {parseStackTabs, parseStackViews} from '../../utils';
import actions from '../actions';
import css from './styles.module.css';

const REFRESH_INTERVAL = 1000;

type Props = {
    loading: boolean,
    currentFrameId: number,
    attachmentIndex: number,
    frame: ?{},
    data: {},
    currentUser?: string,
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
    currentFrameId,
    headId,
    executionId,
    onChangeExecutionId,
    onChangeHeadFrame,
    attachmentIndex,
    onChangeAttachmentIndex,
    onChangeFrame,
    onUpdateReadme,
    data,
    frame,
    loading,
    currentUser,
    backUrl,
    user,
    stack,
    changeAccessLevel,
    updatePermissions,
}: Props) => {
    const {t} = useTranslation();
    const didMountRef = useRef(false);
    const {form, setForm, onChange} = useForm({});
    const [fields, setFields] = useState({});
    const [logsExpand, setExpandLogs] = useState(false);
    const [executeData, setExecuteData] = useState(null);
    const [executing, setExecuting] = useState(false);
    const [calculating, setCalculating] = useState(false);
    const [error, setError] = useState(null);
    const [appAttachment, setAppAttachment] = useState(null);
    const [isScheduled, setIsScheduled] = useState(false);
    const [activeTab, setActiveTab] = useState();
    const [tabs, setTabs] = useState([]);
    const prevFrame = usePrevious(frame);
    const {executeStack, pollStack} = actions();

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
        const fields = parseStackViews(data.views);
        const form = getFormFromViews(data.views);

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
        else {
            setAppAttachment(null);
            setActiveExecutionId(undefined);
        }

        executeStack({
            user: data.user,
            stack: data.name,
            frame: frame?.id,
            attachment: attachmentIndex || 0,
            apply,
            views: executeData.views.map((view, index) => {
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

                if (apply) {
                    checkFinished({id: data.id, isUpdateData: apply});
                    setActiveExecutionId(data.id);
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
            submit(form, !!(!hasApplyButton() && appAttachment));
        }
    }, 300, [form]);

    const onApply = () => submit(form);

    useEffect(() => {
        if (executeData && executeData.status === 'READY' && !appAttachment && !executing) {
            if (!hasApplyButton())
                submit(form, true);
        }
    }, [executeData]);

    useEffect(() => {
        if (data?.user && data?.name && frame && !loading) {
            if (!executionId || !isEqual(frame, prevFrame)) {
                setExecuting(true);
                setExecuteData(null);
                setAppAttachment(null);

                executeStack({
                    user: data.user,
                    stack: data.name,
                    frame: frame?.id,
                    attachment: attachmentIndex || 0,
                })
                    .then(data => {
                        setExecuting(false);
                        setError(null);
                        updateExecuteData(data);
                    })
                    .catch(() => {
                        setExecuting(false);
                        setError({status: null});
                    });
            } else {
                setExecuting(true);
                setCalculating(true);
                setAppAttachment(null);
                checkFinished({id: executionId, isUpdateData: true});
            }
        }

    }, [data, frame, attachmentIndex]);

    useEffect(() => {
        if ((!isEqual(prevFrame, frame) || !didMountRef.current) && frame)
            parseTabs();
    }, [frame]);

    useEffect(() => {
        if (!didMountRef.current)
            didMountRef.current = true;
    }, []);

    const getCurrentAttachment = selectedTab => {
        const attachments = get(frame, 'attachments');

        let attachment;

        if (selectedTab) {
            attachment = attachments.find(attach => {
                return (attach.params[selectedTab.value]?.type === 'tab'
                    || attach.params[selectedTab.key]?.title === selectedTab.value
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
        const attachments = get(frame, 'attachments');

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

        const attachments = get(frame, 'attachments');
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
                setIsScheduled(data.status === 'SCHEDULED');

                if (['SCHEDULED', 'RUNNING'].indexOf(data.status) >= 0)
                    setTimeout(() => {
                        checkFinished({id: data.id});
                    }, REFRESH_INTERVAL);

                if (['FINISHED', 'FAILED', 'READY'].indexOf(data.status) >= 0) {
                    setCalculating(false);
                }

                if (data.status === 'FINISHED') {
                    setAppAttachment(data.output);

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

                if (data.status === 'FAILED') {
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

                    setActiveExecutionId(null);
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

                <div className={css.sideHeader}>
                    {data && data.user === currentUser && (
                        <Share
                            instancePath={`${user}/${stack}`}
                            stackName={stack}
                            onChangeAccessLevel={changeAccessLevel}
                            className={css.share}
                            accessLevel={data['access_level']}
                            defaultPermissions={data.permissions}

                            urlParams={{
                                a: attachmentIndex ? attachmentIndex : null,
                                f: frame?.id !== data?.head?.id ? frame?.id : null,
                                'execution_id': executionId,
                            }}

                            onUpdatePermissions={
                                permissions => updatePermissions(`${user}/${stack}`, permissions)
                            }
                        />
                    )}
                </div>
            </div>

            {/*<StackFrames*/}
            {/*    frames={get(data, 'frames', [])}*/}
            {/*    frame={currentFrameId}*/}
            {/*    headId={headId}*/}
            {/*    onMarkAsHead={onChangeHeadFrame}*/}
            {/*    onChange={onChangeFrame}*/}
            {/*    className={css.revisions}*/}
            {/*/>*/}

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
                    <StackFilters
                        fields={fields}
                        form={form}
                        onChange={onChange}
                        onApply={onApply}
                        className={cx(css.filters)}
                        isSidebar={withSidebar}
                        disabled={executing || calculating}
                    />

                    {appAttachment && !calculating && (
                        <StackAttachment
                            className={css.attachment}
                            stack={`${user}/${stack}`}
                            customData={appAttachment}
                        />
                    )}

                    {calculating && !isScheduled && <Progress className={css.progress} />}

                    {calculating && isScheduled && (
                        <div className={css.initMessage}>
                            {t('initializingTheApplication')}
                        </div>
                    )}

                    {!calculating && !executing && !appAttachment && !error && (
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
