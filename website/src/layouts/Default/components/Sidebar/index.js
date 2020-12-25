import React, {useRef} from 'react';
import {connect} from 'react-redux';
import {Link, NavLink, useParams, useLocation} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import cx from 'classnames';
import {useAppStore, appStoreActionTypes, Tooltip} from '@dstackai/dstack-react';
import {isSignedIn} from '@dstackai/dstack-react/dist/utils';
import {useOnClickOutside} from '@dstackai/dstack-react/dist/hooks';
import config from 'config';
import routes from 'routes';
import logo from 'assets/logo.svg';
import {ReactComponent as Apps} from 'assets/applications.svg';
import {ReactComponent as Models} from 'assets/models.svg';
import logoCompact from 'assets/logo-compact.svg';
import css from './styles.module.css';
import {fetchList as fetchStacksList} from 'Stacks/List/actions';


type Props = {
    className?: string,
    currentUser?: string,
    toggleMenu: Function,
    isShow: boolean,
    userLoading: boolean,
}

const Sidebar = ({
    className, currentUser, isShow, toggleMenu, userLoading,
    fetchStacksList, compact, toggleCollapse,
}: Props) => {
    const {t} = useTranslation();
    const params = useParams();
    const {pathname} = useLocation();
    const [, dispatch] = useAppStore();
    const sidebarRef = useRef(null);

    useOnClickOutside(sidebarRef, () => isShow && toggleMenu());

    const getMenuItemClick = item => () => {
        if (isShow)
            toggleMenu();

        if (item.onClick)
            item.onClick();
    };

    const getRefreshStacks = (category: 'applications' | 'category') => () => {
        if (pathname === routes.categoryStacks(params.user, category)) {
            dispatch({type: appStoreActionTypes.START_PROGRESS});
            fetchStacksList(params.user, () => {
                dispatch({type: appStoreActionTypes.COMPLETE_PROGRESS});
            });
        }
    };

    const menuItems = [
        {
            svg: Apps,
            to: routes.categoryStacks(currentUser, 'applications'),
            label: t('application_plural'),
            onClick: getRefreshStacks('applications'),
        },
        {
            svg: Models,
            to: routes.categoryStacks(currentUser, 'models'),
            label: t('mlModel_plural'),
            onClick: getRefreshStacks('models'),
        },
    ];

    return <div className={cx(css.sidebar, className, {show: isShow, compact})} ref={sidebarRef}>
        <div className={cx(css.close, 'mdi mdi-close')} onClick={toggleMenu} />

        <div className={css.logo}>
            <Link to="/">
                <img width="129" height="35" src={logo} alt="logo"/>
                <img width="38" height="35" src={logoCompact} alt="logo"/>
            </Link>
        </div>

        {isSignedIn() && !userLoading && <ul className={css.links}>
            {menuItems.map((item, index) => (
                <li key={index} className={css.item}>
                    <Tooltip
                        overlayContent={item.label}
                        placement="rightTop"
                        trigger={compact ? ['hover'] : []}
                        align={{offset: [20, -10]}}
                    >
                        <NavLink
                            onClick={getMenuItemClick(item)}
                            to={item.to}
                            activeClassName="active"
                            isActive={item.isActive}
                        >
                            {item.svg && (
                                <item.svg className={css.icon} />
                            )}
                            {item.icon && (
                                <span className={cx(css.icon, 'mdi', item.icon)} />
                            )}
                            <span className={css.label}>{item.label}</span>
                            {/*<span className={css.count}>11</span>*/}

                            {item.beta && <sub className={cx(css.sub, 'green-text')}>
                                {t('beta')}
                            </sub>}
                        </NavLink>
                    </Tooltip>
                </li>
            ))}

            <li className={css.itemSeparator} />

            <li className={css.item}>
                <Tooltip
                    overlayContent={t('settings')}
                    placement="rightTop"
                    trigger={compact ? ['hover'] : []}
                    align={{offset: [20, -10]}}
                >
                    <NavLink
                        activeClassName="active"
                        to={routes.settings()}
                    >
                        <span className={cx(css.icon, 'mdi mdi-settings')} />
                        <span className={css.label}>{t('settings')}</span>
                    </NavLink>
                </Tooltip>
            </li>

            <li className={css.item}>
                <Tooltip
                    overlayContent={t('documentation')}
                    placement="rightTop"
                    trigger={compact ? ['hover'] : []}
                    align={{offset: [20, -10]}}
                >
                    <a
                        href={config.DOCS_URL}
                        target="_blank"
                    >
                        <span className={cx(css.icon, 'mdi mdi-file-document')} />
                        <span className={css.label}>{t('documentation')}</span>
                    </a>
                </Tooltip>
            </li>

            <li className={css.item}>
                <Tooltip
                    overlayContent={t('discordChat')}
                    placement="rightTop"
                    trigger={compact ? ['hover'] : []}
                    align={{offset: [20, -10]}}
                >
                    <a
                        href={config.DISCORD_URL}
                        target="_blank"
                    >
                        <span className={cx(css.icon, 'mdi mdi-discord')} />
                        <span className={css.label}>{t('discordChat')}</span>
                    </a>
                </Tooltip>
            </li>
        </ul>}

        <button className={css.collapse} onClick={toggleCollapse}>
            <span className={cx(css.icon, 'mdi mdi-chevron-double-left')} />
            <span className={css.label}>{t('collapse')}</span>
        </button>
    </div>;
};

export default connect(
    state => ({
        currentUser: state.app.userData?.user,
        userLoading: state.app.userLoading,
    }),

    {fetchStacksList}
)(Sidebar);
