// @flow
import React, {useEffect, useState, Fragment, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';
import useSWR from 'swr';
import Button from '../../Button';
import Modal from '../../Modal';
import SearchField from '../../SearchField';
import CheckboxField from '../../CheckboxField';
import StackListItem from '../../stack/ListItem';
import Loader from './Loader';
import {useAppStore} from '../../AppStore';
import {dataFetcher} from '../../utils';
import config from '../../config';
import css from './style.module.css';

type Props = {
    isShow?: boolean,
    stacks?: Array<{}>,
    loading?: boolean,
    fetchList: Function,
    onAddStacks?: Function,
    onClose: Function,
}

const dataFormat = data => data.stacks;

const AddStacksModal = ({
    isShow,
    onClose,
    onAddStacks,
}: Props) => {
    const {t} = useTranslation();
    const params = useParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [selected, setSelected] = useState([]);
    const [{currentUser, apiUrl}] = useAppStore();
    const currentUserName = currentUser.data?.user;

    const {data} = useSWR(
        [
            apiUrl + config.USER_STACK_LIST(params.user),
            dataFormat,
        ],
        dataFetcher,
    );

    useEffect(() => {
        if (!isShow) {
            setSelected([]);
            setSearchQuery('');
        }
    }, [isShow]);

    const items = useMemo(() => {
        let items = [];

        if (data && data.length) {
            if (searchQuery.length)
                items = data.filter(i => i.name.indexOf(searchQuery) >= 0);
            else
                items = data;
        }

        return items;
    }, [data, searchQuery]);

    const onChangeSearch = value => setSearchQuery(value);

    const getFullStackName = stack => `${stack.user}/${stack.name}`;

    const isChecked = stack => {
        const stackName = getFullStackName(stack);

        return selected.findIndex(i => i === stackName) >= 0;
    };

    const getOnClickStack = stack => () => {
        const stackName = getFullStackName(stack);

        if (isChecked(stack)) {
            const filtered = selected.filter(i => i !== stackName);

            setSelected(filtered);
        } else {
            setSelected([
                ...selected,
                stackName,
            ]);
        }
    };

    const submit = () => {
        if (onAddStacks)
            onAddStacks(selected);

        onClose();
    };

    const isUserOwner = currentUserName === params.user;

    return (
        <Modal
            dialogClassName={css.stacks}
            isShow={isShow}
            title={t('selectStacks')}
            onClose={onClose}
            withCloseButton
        >
            {data && Boolean(data.length) && (
                <SearchField
                    className={css.search}
                    isDark
                    size="middle"
                    showEverything
                    placeholder={t('findStack')}
                    value={searchQuery}
                    onChange={onChangeSearch}
                />
            )}

            {!data && <Loader />}

            {data && Boolean(data.length) && (
                <div className={css.message}>
                    {isUserOwner
                        ? t('youHaveNoStacksYet')
                        : t('theUserHasNoStacksYetByName', {name: params.user})
                    }
                </div>
            )}

            {data && Boolean(data.length && !items.length) && (
                <div className={css.text}>
                    {t('noStacksAreFoundedMatchedTheSearchCriteria')}
                </div>
            )}

            {data && Boolean(data.length && items.length) && (
                <Fragment>
                    <div className={css.grid}>
                        {items.map((item, index) => (
                            <div className={css.item} key={index} onClick={getOnClickStack(item)}>
                                <CheckboxField
                                    className={css.checkbox}
                                    value={isChecked(item)}
                                    readOnly
                                />

                                <StackListItem
                                    data={item}
                                />
                            </div>
                        ))}
                    </div>

                    <div className={css.buttons}>
                        <Button
                            className={css.button}
                            color="primary"
                            variant="contained"
                            disabled={!selected.length}
                            onClick={submit}
                        >
                            {t('addSelectedStacks')}
                        </Button>

                        <Button
                            className={css.button}
                            color="secondary"
                            variant="contained"
                            onClick={onClose}
                        >
                            {t('cancel')}
                        </Button>
                    </div>
                </Fragment>

            )}
        </Modal>
    );
};

export default AddStacksModal;
