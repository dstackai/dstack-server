// @flow

import React, {useEffect, useState, useRef, useCallback} from 'react';
import cx from 'classnames';
import {useTranslation} from 'react-i18next';
import {isEqual, get} from 'lodash-es';
import usePrevious from 'hooks/usePrevious';
import {Link} from 'react-router-dom';
import {debounce as _debounce} from 'lodash-es';
import BackButton from 'components/BackButton';
import Share from 'components/Share';
import PermissionUsers from 'components/PermissionUsers';
import StackFilters from 'components/StackFilters';
import StackAttachment from '../Attachment';
import Loader from './components/Loader';
import Tabs from './components/Tabs';
import Readme from './components/Readme';
import useForm from 'hooks/useForm';
import {parseStackParams, parseStackTabs} from 'utils';
import {useAppStore} from 'AppStore';
import Avatar from 'components/Avatar';
import Markdown from 'components/stack/Markdown';
import css from './styles.module.css';

type Props = {
    loading: boolean,
    currentFrameId: number,
    attachmentIndex: number,
    frame: ?{},
    data: {},
    downloadAttachment: Function,
    backUrl: string,
    user: string,
    stack: string,
    headId: number,
    onChangeHeadFrame: Function,
    onUpdateReadme: Function,
    onChangeAttachmentIndex: Function,
    onChangeFrame: Function,
    changeAccessLevel: Function,
    updatePermissions: Function,
}

const Details = ({
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
    const didMountRef = useRef(false);
    const {form, setForm, onChange} = useForm({});
    const [activeTab, setActiveTab] = useState();
    const [fields, setFields] = useState({});
    const [tabs, setTabs] = useState([]);
    const prevFrame = usePrevious(frame);

    const [{currentUser}] = useAppStore();
    const currentUserName = currentUser.data?.user;

    useEffect(() => {
        if ((!isEqual(prevFrame, frame) || !didMountRef.current) && frame)
            parseTabs();
    }, [frame]);

    const findAttach = useCallback((form, tabName, attachmentIndex) => {
        const attachments = get(frame, 'attachments');
        const fields = Object.keys(form);
        const tab = tabs.find(t => t.value === tabName);

        if (!attachments)
            return;

        if (fields.length || tabs.length) {
            attachments.some((attach, index) => {
                let valid = true;

                if (tab
                    && attach.params[tab.value]?.type !== 'tab'
                    && attach.params[tab.key]?.title !== tab.value
                )
                    return false;

                fields.forEach(key => {
                    if (!attach.params || !isEqual(attach.params[key], form[key]))
                        valid = false;
                });

                if (valid && !(attachmentIndex === undefined && index === 0))
                    onChangeAttachmentIndex(index);

                return valid;
            });
        }
    }, [tabs]);

    const findAttachDebounce = useCallback(_debounce(findAttach, 300), [data, frame, findAttach]);

    useEffect(() => {
        if (didMountRef.current)
            findAttachDebounce(form, activeTab, attachmentIndex);
    }, [form]);

    useEffect(() => {
        if (didMountRef.current)
            parseParams();
    }, [activeTab]);

    useEffect(() => {
        if (!didMountRef.current)
            didMountRef.current = true;
    }, []);

    const getCurrentAttachment = tabName => {
        const attachments = get(frame, 'attachments');

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

    const parseParams = () => {
        const attachments = get(frame, 'attachments');
        const attachment = getCurrentAttachment(activeTab);
        const tab = tabs.find(t => t.value === activeTab);
        const fields = parseStackParams(attachments, tab);

        setFields(fields);

        if (attachment) {
            const params = {...attachment.params};
            const tab = Object.keys(params).find(key => params[key]?.type === 'tab');

            delete params[tab];
            setForm(params);
        }
    };

    const onChangeTab = tabName => {
        findAttachDebounce(form, tabName, attachmentIndex);
        setActiveTab(tabName);
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
            >{t('backToModels')}</BackButton>

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
                    {data && data.user === currentUserName && (
                        <Share
                            stackName={stack}
                            instancePath={`${user}/${stack}`}
                            onChangeAccessLevel={changeAccessLevel}
                            className={css.share}
                            accessLevel={data['access_level']}
                            defaultPermissions={data.permissions}

                            urlParams={{
                                a: attachmentIndex ? attachmentIndex : null,
                                f: frame?.id !== data?.head?.id ? frame?.id : null,
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
                items={tabs}
            />}

            <div className={cx(css.container, {[css.withFilters]: Object.keys(fields).length})}>
                {attachment?.description && (
                    <Markdown className={css.description}>{attachment.description}</Markdown>
                )}

                <StackFilters
                    fields={fields}
                    form={form}
                    onChange={onChange}
                    className={cx(css.filters)}
                />

                {frame && (
                    <StackAttachment
                        className={css.attachment}
                        withLoader
                        stack={`${user}/${stack}`}
                        frameId={frame.id}
                        id={attachmentIndex || 0}
                    />
                )}
            </div>

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
