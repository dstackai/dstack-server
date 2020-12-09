// @flow

import React, {useEffect, useState, useRef, useCallback} from 'react';
import cx from 'classnames';
import {isEqual, get} from 'lodash-es';
import usePrevious from '../../hooks/usePrevious';
import {useTranslation} from 'react-i18next';
import {Link} from 'react-router-dom';
import {debounce as _debounce} from 'lodash-es';
import Button from '../../Button';
import MarkdownRender from '../../MarkdownRender';
import Modal from '../../Modal';
import Dropdown from '../../Dropdown';
import Yield from '../../Yield';
import BackButton from '../../BackButton';
import Share from '../../Share';
import PermissionUsers from '../../PermissionUsers';
import StackFilters from '../../StackFilters';
import StackHowToFetchData from '../HowToFetchData';
import StackAttachment from '../Attachment';
import StackFrames from '../Frames';
import Loader from './components/Loader';
import Tabs from './components/Tabs';
import Readme from './components/Readme';
import useForm from '../../hooks/useForm';
import {formatBytes, parseStackParams, parseStackTabs} from '../../utils';
import css from './styles.module.css';

type Props = {
    loading: boolean,
    currentFrameId: number,
    attachmentIndex: number,
    frame: ?{},
    data: {},
    currentUser?: string,
    downloadAttachment: Function,
    toggleUpload: Function,
    backUrl: string,
    user: string,
    stack: string,
    headId: number,
    onChangeHeadFrame: Function,
    onUpdateReadme: Function,
    onChangeAttachmentIndex: Function,
    onChangeFrame: Function,
    configurePythonCommand: string,
    configureRCommand: string,
    setPrivate: Function,
    updatePermissions: Function,
}

const Details = ({
    currentFrameId,
    headId,
    onChangeHeadFrame,
    attachmentIndex,
    onChangeAttachmentIndex,
    downloadAttachment,
    onChangeFrame,
    onUpdateReadme,
    data,
    frame,
    loading,
    currentUser,
    toggleUpload,
    backUrl,
    user,
    stack,
    configurePythonCommand,
    configureRCommand,
    setPrivate,
    updatePermissions,
}: Props) => {
    const {t} = useTranslation();
    const didMountRef = useRef(false);
    const {form, setForm, onChange} = useForm({});
    const [activeTab, setActiveTab] = useState();
    const [fields, setFields] = useState({});
    const [tabs, setTabs] = useState([]);
    const prevFrame = usePrevious(frame);

    const [isShowHowToModal, setIsShowHowToModal] = useState(false);

    const showHowToModal = event => {
        event.preventDefault();
        setIsShowHowToModal(true);
    };

    const hideHowToModal = () => setIsShowHowToModal(false);

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

    const parseParams = () => {
        const attachments = get(frame, 'attachments');
        const tab = tabs.find(t => t.value === activeTab);
        const attachment = getCurrentAttachment(tab);
        const fields = parseStackParams(attachments, tab);

        setFields(fields);

        if (attachment) {
            const params = {...attachment.params};
            const tab = Object.keys(params).find(key => params[key]?.type === 'tab');

            delete params[tab];
            setForm(params);
        }
    };

    const onClickDownloadAttachment = event => {
        event.preventDefault();
        downloadAttachment();
    };

    const onChangeTab = tabName => {
        findAttachDebounce(form, tabName, attachmentIndex);
        setActiveTab(tabName);
    };

    const attachment = get(frame, `attachments[${attachmentIndex}]`);

    if (loading)
        return <Loader />;

    return (
        <div className={cx(css.details)}>
            <Yield name="header-yield">
                <BackButton
                    Component={Link}
                    to={backUrl}
                >
                    {(currentUser === user)
                        ? t('backToMyStacks')
                        : t('backToStacksOf', {name: user})
                    }
                </BackButton>
            </Yield>

            <div className={css.header}>
                <div className={css.title}>
                    {data.name}
                    <span className={`mdi mdi-lock${data.private ? '' : '-open'}`} />
                </div>

                {data.private && (
                    <PermissionUsers
                        className={css.permissions}
                        permissions={data.permissions}
                    />
                )}

                <div className={css.sideHeader}>
                    {data && data.user === currentUser && (
                        <Share
                            instancePath={`${user}/${stack}`}
                            onUpdatePrivate={setPrivate}
                            className={css.share}
                            defaultIsPrivate={data.private}
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

                    {data && data.user === currentUser && (
                        <Dropdown
                            className={css.dropdown}

                            items={[
                                {
                                    title: t('upload'),
                                    onClick: toggleUpload,
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

            <StackFrames
                frames={get(data, 'frames', [])}
                frame={currentFrameId}
                headId={headId}
                onMarkAsHead={onChangeHeadFrame}
                onChange={onChangeFrame}
                className={css.revisions}
            />

            {Boolean(tabs.length) && <Tabs
                className={css.tabs}
                onChange={onChangeTab}
                value={activeTab}
                items={tabs}
            />}

            <div className={cx(css.container, {[css.withFilters]: Object.keys(fields).length})}>
                <StackFilters
                    fields={fields}
                    form={form}
                    onChange={onChange}
                    className={cx(css.filters)}
                />

                {attachment
                    && (attachment.description || attachment['content_type'] === 'text/csv')
                    && (
                        <div className={css['attachment-head']}>
                            <div className={css.description}>
                                {attachment.description && (<MarkdownRender source={attachment.description} />)}
                            </div>

                            {attachment['content_type'] === 'text/csv' && (
                                <div className={css.actions}>
                                    {attachment.preview && (
                                        <div className={css.label}>
                                            {t('preview')}

                                            <div className={css['label-tooltip']}>
                                                {t('theTableBelowShowsOnlyAPreview')}
                                            </div>
                                        </div>
                                    )}

                                    <a href="#" onClick={showHowToModal}>{t('useThisStackViaAPI')}</a>
                                    <span>{t('or')}</span>
                                    <a href="#" onClick={onClickDownloadAttachment}>{t('download')}</a>
                                    {attachment.length && (
                                        <span className={css.size}>({formatBytes(attachment.length)})</span>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                }

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

            <Modal
                isShow={isShowHowToModal}
                withCloseButton
                onClose={hideHowToModal}
                size="big"
                title={t('howToFetchDataUsingTheAPI')}
                className={css.modal}
            >
                <StackHowToFetchData
                    configurePythonCommand={configurePythonCommand}
                    configureRCommand={configureRCommand}

                    data={{
                        stack: `${user}/${stack}`,
                        params: form,
                    }}

                    modalMode
                />
            </Modal>
        </div>
    );
};

export default Details;
