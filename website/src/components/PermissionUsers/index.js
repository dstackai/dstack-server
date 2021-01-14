// @flow
import React from 'react';
import cx from 'classnames';
import Avatar from 'components/Avatar';
import css from './styles.module.css';

type Props = {
    permissions?: Array<{
        user?: string,
        email?: string,
    }>,

    maxLength?: number,
    className?: string,
    owner?: string,
    variant?: 'list' | 'details',
}

const PermissionUsers = ({permissions, className, variant = 'details', maxLength, owner}: Props) => {
    if (!permissions || !permissions.length)
        return null;

    return (
        <div className={cx(css.list, className, variant)}>
            {permissions.slice(0, maxLength).map((i, index) => (
                <Avatar
                    withBorder
                    size={variant === 'list' ? 'list' : 'small'}
                    key={index}
                    className={cx(css.avatar, {owner: owner === i.user})}
                    name={i.user || i.email}
                />
            ))}

            {maxLength && maxLength < permissions.length  && (
                <span className={css.count}>+{permissions.length - maxLength}</span>
            )}
        </div>
    );
};

export default PermissionUsers;
