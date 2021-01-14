import React, {useRef} from 'react';
import {connect} from 'react-redux';
import {Link, NavLink, useParams, useLocation, useHistory} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import cx from 'classnames';
import Avatar from 'components/Avatar';
import Dropdown from 'components/Dropdown';
import {useAppStore} from 'AppStore';
import appStoreActionTypes from 'AppStore/actionsTypes';
import {isSignedIn} from 'utils';
import {useOnClickOutside} from 'hooks';
import config from 'config';
import routes from 'routes';
import logo from 'assets/logo.svg';
import {ReactComponent as Apps} from 'assets/applications.svg';
import {ReactComponent as Models} from 'assets/models.svg';
import logoCompact from 'assets/logo-compact.svg';
import css from './styles.module.css';
import {fetchList as fetchStacksList} from 'Stacks/List/actions';
import {logOut} from 'App/actions';


type Props = {
    className?: string,
    toggleMenu: Function,
    isShow: boolean,
    userLoading: boolean,
    logOut: Function,
}

const Sidebar = ({
    className, isShow, toggleMenu, userLoading,
    fetchStacksList, compact, toggleCollapse, logOut,
}: Props) => {
    const {t} = useTranslation();
    const params = useParams();
    const {pathname} = useLocation();
    const [{currentUser: {data: userData}}, dispatch] = useAppStore();
    const sidebarRef = useRef(null);
    const {push} = useHistory();

    const logOutHandle = () => {
        logOut(() => push('/'));
    };

    useOnClickOutside(sidebarRef, () => isShow && toggleMenu());

    const getMenuItemClick = item => () => {
        if (isShow)
            toggleMenu();

        if (item.onClick)
            item.onClick();
    };

    const getRefreshStacks = (category: 'applications' | 'category') => () => {
        if (pathname === routes.categoryStacks(category)) {
            dispatch({type: appStoreActionTypes.START_PROGRESS});

            fetchStacksList(params.user, () => {
                dispatch({type: appStoreActionTypes.COMPLETE_PROGRESS});
            });
        }
    };

    const menuItems = [
        {
            svg: Apps,
            to: routes.categoryStacks('applications'),
            label: t('application_plural'),
            onClick: getRefreshStacks('applications'),
        },
        {
            svg: Models,
            to: routes.categoryStacks('models'),
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
                    <NavLink
                        onClick={getMenuItemClick(item)}
                        to={item.to}
                        activeClassName="active"
                        isActive={item.isActive}
                    >
                        {item.svg && (
                            <span className={css.icon}>
                                <item.svg />
                            </span>
                        )}

                        {item.icon && (
                            <span className={cx(css.icon, 'mdi', item.icon)} />
                        )}

                        <span className={css.labelWrap}>
                            <span className={css.label}>{item.label}</span>
                            {/*<span className={css.count}>11</span>*/}

                            {item.beta && <sub className={cx(css.sub, 'green-text')}>
                                {t('beta')}
                            </sub>}
                        </span>
                    </NavLink>
                </li>
            ))}

            <li className={css.itemSeparator} />

            <li className={css.item}>
                <NavLink
                    activeClassName="active"
                    to={routes.settings()}
                >
                    <span className={cx(css.icon, 'mdi mdi-settings')} />

                    <span className={css.labelWrap}>
                        <span className={css.label}>{t('settings')}</span>
                    </span>
                </NavLink>
            </li>

            <li className={css.item}>
                <a
                    href={config.DOCS_URL}
                    target="_blank"
                >
                    <span className={cx(css.icon, 'mdi mdi-file-document')} />

                    <span className={css.labelWrap}>
                        <span className={css.label}>{t('documentation')}</span>
                    </span>
                </a>
            </li>

            <li className={css.item}>
                <a
                    href={config.DISCORD_URL}
                    target="_blank"
                >
                    <span className={cx(css.icon, 'mdi mdi-discord')} />

                    <span className={css.labelWrap}>
                        <span className={css.label}>{t('discordChat')}</span>
                    </span>
                </a>
            </li>
        </ul>}

        <div className={css.bottomSection}>
            {userData && (
                <Dropdown
                    className={css.userDropdown}
                    items={[
                        {
                            title: t('signOut'),
                            onClick: logOutHandle,
                        },
                    ]}
                >
                    <div className={css.user}>
                        <Avatar className={css.avatar} name={userData.user} />
                        <div className={css.userName}>{userData.user}</div>
                    </div>
                </Dropdown>
            )}

            <button className={css.collapse} onClick={toggleCollapse}>
                <span className={cx(css.icon, 'mdi mdi-chevron-double-left')} />
            </button>
        </div>
    </div>;
};

export default connect(
    state => ({
        currentUser: state.app.userData?.user,
        userLoading: state.app.userLoading,
    }),

    {fetchStacksList, logOut}
)(Sidebar);
