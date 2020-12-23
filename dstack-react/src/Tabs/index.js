// @flow

import React from 'react';
import {useTranslation} from 'react-i18next';
import cx from 'classnames';
import css from './styles.module.css';

type Value = ?string | ?number;

type Tab = {
    label: string,
    value?: Value,
}

type Props = {
    appearance: 'transparent' | 'stroke-filled',
    className?: string,
    onChange?: Function,
    tabs: Array<Tab>,
    tabComponent?: any,
    value?: Value,
}

const Tabs = ({className, value: currentTabValue, tabs, appearance = 'transparent', onChange, tabComponent}: Props) => {
    const {t} = useTranslation();

    const getOnClickTab = (value: Value) => () => {
        if (typeof onChange === 'function')
            onChange(value);
    };

    const Component = tabComponent ? tabComponent : 'div';


    return (
        <div className={cx(css.tabs, appearance, className)}>
            {tabs.map(({value, label, soon, ...rest}, index) => (
                <Component
                    {...rest}
                    key={index}
                    className={cx(css.tab, {active: value && value === currentTabValue})}
                    onClick={getOnClickTab(value)}
                >
                    {label}
                    {soon && <span className={css.soon}>{t('soon')}</span>}
                </Component>
            ))}
        </div>
    );
};

export default Tabs;
