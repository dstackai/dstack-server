// @flow

import React, {useState, useEffect, useRef} from 'react';
import cn from 'classnames';
import {Link} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import Button from '../../Button';
import Modal from '../../Modal';
import SearchField from '../../SearchField';
import StackListItem from '../ListItem';
import getStackCategory from '../../utils/getStackCategory';
import routes from '../../routes';
import css from './styles.module.css';

type Stack = {
    [key: string]: any,
} | string;

type Props = {
    deleteStack: Function,
    data: Array<Stack>,
    loading: boolean,
    currentUser?: string,
    category: string,
};

const List = ({
    data = [],
    loading,
    deleteStack,
    currentUser,
    user,
    category,
}: Props) => {
    const {t} = useTranslation();

    const categoryMap = {
        applications: 'app',
        models: 'mlModel',
    };

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

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            if (!localStorage.getItem('welcome-modal-is-showing') && !loading && !data.length)
                showWelcomeModal();
        }
    }, [data]);

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

        const items = data.filter(stack => {
            const stackCategory = getStackCategory({
                application: stack.head?.preview?.application,
                contentType: stack.head?.preview?.content_type,
            });

            return stackCategory === categoryMap[category];
        });

        if (items && items.length) {
            if (search.length)
                filteredItems = items.filter(i => i.name.indexOf(search) >= 0);
            else
                filteredItems = items;
        }

        return filteredItems;
    };

    const items = getItems();

    return (
        <div className={css.list}>
            <div className={css.header}>
                <div className={css.title}>
                    {{
                        applications: t('application_plural'),
                        models: t('mlModel_plural'),
                    }[category]}
                </div>

                {Boolean(data.length) && (
                    <div className={css.headerSide}>
                        {Boolean(data.length) && (
                            <SearchField
                                className={css.search}
                                showEverything
                                isDark
                                placeholder={t('findStack')}
                                size="small"
                                value={search}
                                onChange={onChangeSearch}
                            />
                        )}
                    </div>
                )}
            </div>

            {loading && !Boolean(data.length) && (
                <div className={cn(css.itemList)}>
                    {new Array(12).fill({}).map((i, index) => (
                        <div key={index} className={css.loadingItem} />
                    ))}
                </div>
            )}

            {!loading && !data.length && (
                <div className={css.message}>
                    {user === currentUser
                        ? t('youHaveNoStacksYet')
                        : t('theUserHasNoStacksYetByName', {name: user})
                    }
                </div>
            )}

            {Boolean(data.length && items.length) && (
                <div className={css.itemList}>
                    {items.map((item, index) => <StackListItem
                        className={css.item}
                        Component={Link}
                        key={index}
                        data={item}
                        to={routes.stackDetails(item.user, item.name)}
                        deleteAction={currentUser === item.user && showDeleteConfirmation}
                    />)}
                </div>
            )}

            {Boolean(data.length && !items.length) && <div className={css.text}>
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

            {currentUser === user && (
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
