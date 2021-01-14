// @flow

import React, {useEffect, Fragment} from 'react';
import {connect} from 'react-redux';
import {useParams} from 'react-router-dom';
import Helmet from 'react-helmet';
import {Link} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import NotFound from 'components/NotFound';
import StackList from 'components/stack/List';
import UploadStack from 'components/stack/Upload';
import {useAppStore} from 'AppStore';
import appStoreActionTypes from 'AppStore/actionsTypes';
import {isSignedIn} from 'utils';
import {fetchList, deleteStack} from './actions';
import routes from 'routes';
import config from 'config';

type Stack = {
    [key: string]: any,
} | string;

type Props = {
    data: Array<Stack>,
    loading: boolean,
    fetchList: Function,
    deleteStack: Function,
    requestStatus: ?number,
    currentUser?: string,
    currentUserToken?: string,
};

const List = ({
    requestStatus,
    fetchList,
    data = [],
    loading,
    deleteStack,
    currentUser,
    currentUserToken,
}: Props) => {
    const {t} = useTranslation();
    const {user, category} = useParams();
    const [, dispatch] = useAppStore();

    const fetchData = () => {
        dispatch({type: appStoreActionTypes.START_PROGRESS});

        fetchList(user, () => {
            dispatch({type: appStoreActionTypes.COMPLETE_PROGRESS});
        });
    };

    useEffect(() => {
        fetchData();

        return () => {
            dispatch({type: appStoreActionTypes.RESET_PROGRESS});
        };
    }, [user]);


    if (requestStatus === 404)
        return <NotFound>
            {t('theStackYouAreRookingForCouldNotBeFound')}
            {' '}
            {isSignedIn() && (
                <Fragment>
                    <Link to={routes.stacks(currentUser, 'applications')}>
                        {t('goToMyStacks')}
                    </Link>.
                </Fragment>
            )}
        </NotFound>;

    return (
        <Fragment>
            <Helmet>
                <title>dstack.ai{user ? ` | ${user}` : ''}</title>
            </Helmet>

            <StackList
                user={user}
                category={category}
                data={data}
                loading={loading}
                currentUser={currentUser}
                deleteStack={deleteStack}

                {...(currentUser === user
                    ? {
                        renderUploadStack: () => (
                            <UploadStack
                                withFileUpload
                                user={user}
                                configurePythonCommand={config.CONFIGURE_PYTHON_COMMAND(currentUserToken, user)}
                                configureRCommand={config.CONFIGURE_R_COMMAND(currentUserToken, user)}
                                refresh={fetchData}
                                apiUrl={config.API_URL}
                            />
                        ),
                    }

                    : {}
                )}
            />
        </Fragment>
    );
};

export default connect(
    state => ({
        data: state.stacks.list.data,
        requestStatus: state.stacks.list.requestStatus,
        loading: state.stacks.list.loading,
        currentUser: state.app.userData?.user,
        currentUserToken: state.app.userData?.token,
    }),

    {
        fetchList,
        deleteStack,
    },
)(List);
