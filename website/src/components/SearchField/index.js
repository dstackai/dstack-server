// @flow

import React, {useState} from 'react';
import cx from 'classnames';
import TextField from 'components/TextField';
import css from './styles.module.css';

type Props = {
    className?: string,
    showEverything?: boolean,
    isDark?: boolean,
}

const SearchField = ({className, showEverything, isDark, ...props}: Props) => {
    const [isShow, setIsShow] = useState(showEverything || (props.value && props.value.length));

    const clear = () => {
        if (props.onChange)
            props.onChange('');

        if (!showEverything)
            setIsShow(false);
    };

    const onChangeHandle = (event:SyntheticEvent<HTMLInputElement>) => {
        if (props.onChange)
            props.onChange(event.target.value);
    };

    return (
        <div className={cx(css.search, className, {'is-dark': isDark})}>
            {isShow && <TextField
                {...props}
                onChange={onChangeHandle}
                className={css.field}
            />}

            {isShow && Boolean(props.value && props.value.length) && (
                <div className={css.clear} onClick={clear}>
                    <span className="mdi mdi-close" />
                </div>
            )}

            {isShow && !Boolean(props.value && props.value.length) && (
                <div className={css.clear}>
                    <span className="mdi mdi-magnify" />
                </div>
            )}

            {!isShow && <div className={css.button} onClick={() => setIsShow(true)}>
                <span className="mdi mdi-magnify" />
            </div>}
        </div>
    );
};

export default SearchField;
