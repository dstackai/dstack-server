import React, {useRef} from 'react';
import {useTranslation} from 'react-i18next';
import moment from 'moment';
import cn from 'classnames';
import getStackCategory from 'utils/getStackCategory';
import PermissionUsers from 'components/PermissionUsers';
import {useAppStore} from 'AppStore';
import Avatar from 'components/Avatar';
import {ReactComponent as ChartIcon} from './assets/chart.svg';
import {ReactComponent as MLIcon} from './assets/ml.svg';
import {ReactComponent as TableIcon} from './assets/table.svg';
import {ReactComponent as AppIcon} from './assets/app.svg';
import css from './styles.module.css';

type Props = {
    className?: string,
    userData: {user: string},

    data: {
        user: string,
        name: string,
        head: {id: string}
    },

    deleteAction?: Function,
};

const Item = ({
    className,
    Component = 'div',
    data,
    deleteAction,
    ...rest
}: Props) => {
    const {t} = useTranslation();
    const ref = useRef(null);
    const [{currentUser}] = useAppStore();
    const currentUserName = currentUser.data?.user;

    const onClickDelete = event => {
        event.stopPropagation();
        event.preventDefault();
        deleteAction(data.name);
    };

    const renderIcon = () => {
        const contentType = data.head?.preview?.content_type;
        const application = data.head?.preview?.application;

        const category = getStackCategory({
            application,
            contentType,
        });

        switch (category) {
            case 'chart':
                return <ChartIcon />;

            case 'table':
                return <TableIcon />;

            case 'mlModel':
                return <MLIcon />;

            case 'app':
                return <AppIcon />;

            default:
                return null;
        }
    };

    return (
        <Component
            className={cn(css.item, className)}
            ref={ref}
            {...rest}
        >
            <div className={css.icon}>
                {renderIcon()}
            </div>

            <div className={css.top}>
                <div className={css.name} title={data.name}>{data.name}</div>
                <span className={`mdi mdi-lock${data['access_level'] === 'private' ? '' : '-open'}`} />

                {data['access_level'] === 'private' && (
                    <PermissionUsers
                        variant="list"
                        owner={data.user}
                        className={css.permissions}
                        permissions={data.permissions}
                        maxLength={3}
                    />
                )}

                {data.user !== currentUserName && (
                    <Avatar
                        withBorder
                        size="list"
                        className={css.owner}
                        name={data.user}
                    />
                )}
            </div>

            {data.head && (
                <div className={css.date}>
                    {t('updated')} {moment(data.head.timestamp).format('L')}
                </div>
            )}

            {deleteAction && (
                <span className={css.delete} onClick={onClickDelete}>
                    <span className="mdi mdi-close" />
                </span>
            )}
        </Component>
    );
};

export default Item;
