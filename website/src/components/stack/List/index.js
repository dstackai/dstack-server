// @flow

import React, {useState, useEffect, useRef, useMemo} from 'react';
import cn from 'classnames';
import {Link} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import Button from 'components/Button';
import Modal from 'components/Modal';
import SearchField from 'components/SearchField';
import StackListItem from '../ListItem';
import getStackCategory from 'utils/getStackCategory';
import {useAppStore} from 'AppStore';
import routes from 'routes';
import css from './styles.module.css';

type Stack = {
    [key: string]: any,
} | string;

type Props = {
    deleteStack: Function,
    data: Array<Stack>,
    loading: boolean,
    category: string,
};

const List = ({
    data = [],
    loading,
    deleteStack,
    user,
    category,
}: Props) => {
    const {t} = useTranslation();

    const categoryMap = {
        applications: 'app',
        models: 'mlModel',
    };

    const [{currentUser}] = useAppStore();
    const currentUserName = currentUser.data?.user;

    const [deletingStack, setDeletingStack] = useState(null);
    const [isShowWelcomeModal, setIsShowWelcomeModal] = useState(false);
    const [search, setSearch] = useState('');
    const isInitialMount = useRef(true);

    const showWelcomeModal = () => setIsShowWelcomeModal(true);
    const onChangeSearch = value => setSearch(value);

    const hideWelcomeModal = () => {
        localStorage.setItem('welcome-modal-is-showing', true);
        setIsShowWelcomeModal(false);
    };

    const categoryItems = useMemo(() => {
        if (!data || !data.length)
            return [];

        return data.filter(stack => {
            const stackCategory = getStackCategory({
                application: stack.head?.preview?.application,
                contentType: stack.head?.preview?.content_type,
            });

            return stackCategory === categoryMap[category];
        });
    }, [data, category]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            if (!localStorage.getItem('welcome-modal-is-showing') && !loading && !data.length)
                showWelcomeModal();
        }
    }, [categoryItems]);

    const deleteItem = () => {
        deleteStack(deletingStack);
        hideDeleteConfirmation();
    };

    const showDeleteConfirmation = name => {
        setDeletingStack(name);
    };
    const hideDeleteConfirmation = () => setDeletingStack(null);

    const getItems = () => {
        let filteredItems = [];

        if (categoryItems && categoryItems.length) {
            if (search.length)
                filteredItems = categoryItems.filter(i => i.name.indexOf(search) >= 0);
            else
                filteredItems = categoryItems;
        }

        return filteredItems;
    };

    const items = getItems();

    const categoryTitleMap = {
        applications: t('application_plural'),
        models: t('mlModel_plural'),
    };

    return (
        <div className={css.list}>
            <div className={css.header}>
                <div className={css.title}>
                    {categoryTitleMap[category]}
                </div>

                {Boolean(categoryItems.length) && (
                    <div className={css.headerSide}>
                        <SearchField
                            className={css.search}
                            showEverything
                            isDark
                            placeholder={t('findStack')}
                            size="small"
                            value={search}
                            onChange={onChangeSearch}
                        />
                    </div>
                )}
            </div>

            {loading && !Boolean(categoryItems.length) && (
                <div className={cn(css.itemList)}>
                    {new Array(12).fill({}).map((i, index) => (
                        <div key={index} className={css.loadingItem} />
                    ))}
                </div>
            )}

            {!loading && !categoryItems.length && (
                <div className={css.message}>
                    <div className={css.messageText} dangerouslySetInnerHTML={{
                        __html: (user === currentUserName
                            ? t('youHaveNoStacksYetByCategory', {category: categoryTitleMap[category].toLowerCase()})

                            : t('theUserHasNoStacksYetByNameAndCategory', {
                                name: user,
                                category: categoryTitleMap[category].toLowerCase(),
                            })
                        ),
                    }} />

                    <Button
                        Component="a"
                        href="https://docs.dstack.ai/"
                        target="_blank"
                        color="primary"
                        variant="contained"
                        size="small"
                        className={css.messageButton}
                    >{t('getStarted')}</Button>
                </div>
            )}

            {Boolean(categoryItems.length && items.length) && (
                <div className={css.itemList}>
                    {items.map((item, index) => <StackListItem
                        className={css.item}
                        Component={Link}
                        key={index}
                        data={item}
                        to={routes.stackDetails(item.user, item.name)}
                        deleteAction={currentUserName === item.user && showDeleteConfirmation}
                    />)}
                </div>
            )}

            {Boolean(categoryItems.length && !items.length) && <div className={css.text}>
                {{
                    applications: t('noApplicationsMatchingTheSearchCriteria'),
                    models: t('noMlModelsMatchingTheSearchCriteria'),
                }[category]}
            </div>}

            <Modal
                isShow={Boolean(deletingStack)}
                onClose={hideDeleteConfirmation}
                size="confirmation"
                title={t('deleteStack')}
                className={css.modal}
            >
                <div className={css.description}>
                    {t('areYouSureYouWantToDelete', {name: deletingStack})}
                </div>

                <div className={css.buttons}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={hideDeleteConfirmation}
                        className={css.button}
                    >{t('cancel')}</Button>

                    <Button
                        color="secondary"
                        variant="contained"
                        onClick={deleteItem}
                        className={css.button}
                    >{t('deleteStack')}</Button>
                </div>
            </Modal>

            {currentUserName === user && (
                <Modal
                    isShow={isShowWelcomeModal}
                    onClose={hideWelcomeModal}
                    size="small"
                    title={`${t('welcomeToDStack')}👋`}
                    className={css.modal}
                >
                    <div className={css.description}>{t('yourEmailWasSuccessfullyConfirmed')}</div>

                    <div className={css.buttons}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={hideWelcomeModal}
                            className={css.button}
                        >{t('getStarted')}</Button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default List;
