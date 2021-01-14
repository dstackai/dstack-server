// @flow
import React, {memo, Fragment, useEffect, useState, useRef} from 'react';
import moment from 'moment';
import {get, isEqual} from 'lodash-es';
import {useTranslation} from 'react-i18next';
import {usePrevious} from 'react-use';
import {Link} from 'react-router-dom';
import cx from 'classnames';
import parseStackParams from 'utils/parseStackParams';
import parseStackTabs from 'utils/parseStackTabs';
import useDebounce from 'hooks/useDebounce';
import Button from 'components/Button';
import Tooltip from 'components/Tooltip';
import ViewSwitcher from 'components/ViewSwitcher';
import StretchTextareaField from 'components/StretchTextareaField';
import StackAttachment from 'components/stack/Attachment';
import css from './styles.module.css';

export type DashboardCard = {
    stack: string,
    header?: {},
    index: 0,
}

type Props = {
    data: DashboardCard,
    className?: string,
    attachment: {},
    deleteCard: Function,
    updateCard: Function,
    filters: {},
    moveAvailable?: boolean,
}

const viewValueMap = {
    grid: 1,
    list: 2,
};

const Card = memo(({
    data,
    className,
    deleteCard,
    updateCard,
    filters,
    activeTab,
    forwardedRef,
    moveAvailable,
}: Props) => {
    const [title, setTitle] = useState(data.title);
    const [columns, setColumns] = useState(data.columns);
    const descFieldRef = useRef();
    const isMounted = useRef(false);
    const isHoveredMoveBtn = useRef(false);
    const [isShowDesc, setIsShowDesc] = useState(data.description?.length);
    const prevIsShowDesc = usePrevious(isShowDesc);
    const {t} = useTranslation();
    const headId = get(data, 'head.id');
    const stackOwner = data.stack.split('/')[0];
    const [attachmentIndex, setAttachmentIndex] = useState(0);
    const [cardParams, setCardParams] = useState([]);

    useEffect(() => {
        const params = parseStackParams(get(data, 'head.attachments', []));

        if (params)
            setCardParams(Object.keys(params));

    }, [data]);

    useEffect(() => {
        findAttach();
    }, [filters]);

    useEffect(() => {
        if (forwardedRef && forwardedRef.current)
            forwardedRef.current.addEventListener('dragstart', event => {
                if (!isHoveredMoveBtn.current) {
                    event.stopPropagation();
                    event.preventDefault();
                }
            });
    }, [forwardedRef]);

    useEffect(() => {
        if (isMounted.current && prevIsShowDesc !== isShowDesc && descFieldRef.current)
            descFieldRef.current.focus();
    }, [isShowDesc]);

    useEffect(() => {
        isMounted.current = true;
    }, []);

    const findAttach = () => {
        const attachments = get(data, 'head.attachments');
        const tabs = parseStackTabs(attachments);
        const fields = Object.keys(filters).filter(f => cardParams.indexOf(f) >= 0);
        const tab = tabs.find(t => t.value === activeTab);

        if (!attachments)
            return;

        if (fields.length || (tabs.length && activeTab)) {
            attachments.some((attach, index) => {
                let valid = true;

                if (!tab
                    || (attach.params[tab.value]?.type !== 'tab'
                        && attach.params[tab.key]?.title !== tab.value
                    )
                )
                    return false;

                fields.forEach(key => {
                    if (!attach.params || !isEqual(attach.params[key], filters[key]))
                        valid = false;
                });

                if (valid)
                    setAttachmentIndex(index);

                return valid;
            });
        } else
            setAttachmentIndex(0);
    };

    const onUpdate = updateCard ? useDebounce(updateCard, [updateCard]) : () => {};

    const onChangeTitle = event => {
        setTitle(event.target.value);
        onUpdate({title: event.target.value});
    };

    const onChangeView = view => {
        const columns = viewValueMap[view];

        setColumns(columns);
        onUpdate({columns});
    };

    const onChangeDescription = description => {
        setColumns(columns);
        onUpdate({description});
    };

    const onEnterMove = () => {
        isHoveredMoveBtn.current = true;
    };

    const onLeaveMove = () => {
        isHoveredMoveBtn.current = false;
    };

    const onBlurDescription = () => {
        if (!data.description?.length)
            setIsShowDesc(false);
    };

    const addDesc = () => setIsShowDesc(true);

    return (
        <div
            className={cx(css.card, `col-${columns}`, className)}
            ref={forwardedRef}
        >
            <div className={css.inner}>
                <div className={css.head}>
                    <div className={cx(css.name, {readonly: !updateCard})}>
                        <div className={css.nameValue}>{title?.length ? title : t('title')}</div>

                        <input
                            value={title}
                            type="text"
                            placeholder={t('title')}
                            onChange={onChangeTitle}
                            className={cx(css.nameEdit, {active: !title?.length})}
                        />
                    </div>

                    <Tooltip
                        overlayContent={(
                            <Fragment>
                                <div>{t('updatedByName', {name: stackOwner})}</div>

                                {data.head && <div className={css.infoTime}>
                                    {moment(data.head.timestamp).format('D MMM YYYY')}
                                </div>}
                            </Fragment>
                        )}
                    >
                        <div className={css.info}>
                            <span className="mdi mdi-information-outline" />
                        </div>
                    </Tooltip>

                    <Button
                        className={cx(css.button, css.link)}
                        color="secondary"
                        Component={Link}
                        to={`/${data.stack}`}
                    >
                        <span className="mdi mdi-open-in-new" />
                    </Button>

                    <div className={css.cardControls}>
                        {deleteCard && <Button
                            className={cx(css.button)}
                            color="secondary"
                            onClick={deleteCard}
                        >
                            <span className="mdi mdi-trash-can-outline" />
                        </Button>}

                        {moveAvailable && (
                            <Button
                                className={cx(css.button, css.move)}
                                color="secondary"
                                onMouseEnter={onEnterMove}
                                onMouseLeave={onLeaveMove}
                            >
                                <span className="mdi mdi-cursor-move" />
                            </Button>
                        )}

                        <ViewSwitcher
                            onChange={onChangeView}
                            value={data.columns === 1 ? 'grid' : 'list'}
                            className={css.viewSwitcher}
                        />
                    </div>
                </div>

                <div className={css.description}>
                    {isShowDesc && <StretchTextareaField
                        value={data.description}
                        ref={descFieldRef}
                        placeholder={t('description')}
                        onChange={onChangeDescription}
                        onBlur={onBlurDescription}
                        readOnly={!updateCard}
                    />}

                    {!isShowDesc && updateCard && <Button
                        className={cx(css.addDesc)}
                        color="secondary"
                        onClick={addDesc}
                    >
                        + {t('addDescription')}
                    </Button>}
                </div>

                {headId && attachmentIndex !== null
                    ? <StackAttachment
                        className={css.attachment}
                        isList
                        withLoader
                        stack={data.stack}
                        frameId={headId}
                        id={attachmentIndex}
                    />

                    : <div className={css.emptyMessage}>{t('emptyDashboard')}</div>
                }
            </div>
        </div>
    );
});

export default Card;
