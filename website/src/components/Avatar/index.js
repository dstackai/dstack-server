import React, {forwardRef} from 'react';
import cx from 'classnames';
import css from './styles.module.css';

type Props = {
    onClick?: Function,
    withBorder?: boolean,
    className?: string,
    name: string,
    color?: 'violet' | 'turquoise' | 'blue' | 'lilac' | 'pink' | 'green' | 'green2' | 'orange',
    size?: 'small' | 'normal' | 'list',
}

const Avatar = forwardRef(({className, name, color = 'violet', size = 'normal', withBorder, onClick}: Props, ref) => {
    return (
        <div ref={ref} className={cx(css.avatar, className, color, size, {border: withBorder})} onClick={onClick}>
            {name.slice(0, 2)}
        </div>
    );
});

export default Avatar;
