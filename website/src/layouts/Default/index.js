import React, {useState} from 'react';
import cn from 'classnames';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ProgressBar from 'components/ProgressBar';
import {useAppStore} from 'AppStore';
import config from 'config';


import css from './styles.module.css';

const DefaultLayout = ({children}) => {
    const [isShowMenu, setIsShowMenu] = useState(false);
    const toggleMenu = () => setIsShowMenu(!isShowMenu);
    const [{appProgress: {active, value}}] = useAppStore();

    const [compact, setCompact] = useState(() => {
        let isCompact = true;

        const storageValue = localStorage.getItem(config.SIDEBAR_COLLAPSE_STORAGE_KEY);

        if (storageValue)
            isCompact = storageValue === 'true';

        return isCompact;
    });

    const toggleCollapse = () => {
        setCompact(value => {
            localStorage.setItem(config.SIDEBAR_COLLAPSE_STORAGE_KEY, !value);
            return !value;
        });
    };

    return (
        <div className={cn(css.layout, {[css.compactSidebar]: compact})}>
            <Sidebar
                isShow={isShowMenu}
                toggleMenu={toggleMenu}
                className={css.sidebar}
                compact={compact}
                toggleCollapse={toggleCollapse}
            />

            <ProgressBar
                className={css.progress}
                isActive={active}
                progress={value}
            />

            <Header
                toggleMenu={toggleMenu}
                className={css.header}
            />

            <div className={css.main}>
                {children}
            </div>
        </div>
    );
};

export default DefaultLayout;
