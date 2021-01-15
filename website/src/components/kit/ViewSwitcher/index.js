// @flow
import React, {useEffect, useState} from 'react';
import cx from 'classnames';
import css from './styles.module.css';

type Props = {
    value?: 'grid' | 'list',
    onChange?: Function,
    className?: string,
}

const ViewSwitcher = ({value = 'grid', onChange, className}: Props) => {
    const [stateValue, setStateValue] = useState(value);

    useEffect(() => {
        if (value !== stateValue)
            setStateValue(value);

    }, [value]);

    const toggleValue = () => {
        const newValue = stateValue === 'grid' ? 'list' : 'grid';

        setStateValue(newValue);

        if (onChange)
            onChange(newValue);
    };

    return (
        <div
            className={cx(css.switcher, stateValue, className)}
            onClick={toggleValue}
        >
            <span className="mdi mdi-view-grid" />
            <span className="mdi mdi-view-list" />
        </div>
    );
};

export default ViewSwitcher;