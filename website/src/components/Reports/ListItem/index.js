// @flow
import React, {useRef} from 'react';
import {get} from 'lodash-es';
import {Link} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import Dropdown from 'components/Dropdown';
import StackAttachment from 'components/stack/Attachment';
import css from './styles.module.css';

type Props = {
    data: {},
    delete?: Function,
    renderContent?: Function,
}

const Item = ({data, deleteItem, user, renderContent}: Props) => {
    const {t} = useTranslation();
    const ref = useRef(null);

    const hasStacks = data.cards && Boolean(data.cards.length);
    const card = data.cards.find(c => get(c, 'head.id'));
    const isShowDropdown = Boolean(deleteItem);

    return (
        <Link
            to={`/${user}/d/${data.id}`}
            className={css.item}
            ref={ref}
        >
            {Boolean(data.cards.length) && (
                <div className={css.label}>
                    {t('stacksWithCount', {count: data.cards.length})}
                </div>
            )}

            <div className={css.previewWrap}>
                {hasStacks
                    ? <StackAttachment
                        className={css.attachment}
                        isList
                        withLoader
                        frameId={card.head.id}
                        stack={card.stack}
                        id={0}
                    />

                    : <div className={css.emptyMessage}>{t('emptyDashboard')}</div>
                }
            </div>

            <div className={css.section}>
                <div className={css.content}>
                    <div className={css.name}>
                        {data.title}
                        {' '}
                        <span className={`mdi mdi-lock${data.private ? '' : '-open'}`} />
                    </div>

                    {user !== data.user && (
                        <div className={css.by}>{t('by')} {data.user}</div>
                    )}

                    {renderContent && renderContent(data)}
                </div>

                {isShowDropdown && <Dropdown
                    className={css.dropdown}

                    items={[
                        {
                            title: t('delete'),
                            onClick: deleteItem,
                        },
                    ]}
                />}
            </div>

        </Link>
    );
};

export default Item;
