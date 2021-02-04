// @flow

import React, {useEffect, useState, useRef, Fragment} from 'react';
import useSWR from 'swr';
import {get} from 'lodash-es';
import {useTranslation} from 'react-i18next';
import {Link, useHistory, useLocation, useParams} from 'react-router-dom';
import {connect} from 'react-redux';
import Helmet from 'react-helmet';
import AccessForbidden from 'components/AccessForbidden';
import NotFound from 'components/NotFound';
import StackDetails from 'components/stack/Details';
import StackDetailsApp from 'components/stack/DetailsApp';
import StackUpload from 'components/stack/Upload';
import {isSignedIn, parseSearch, getStackCategory, dataFetcher} from 'utils';
import {deleteStack} from 'Stacks/List/actions';
import {fetchDetails, clearDetails, fetchFrame, downloadAttachment, update, updatePermissions} from './actions';
import routes from 'routes';
import config from 'config';

type Props = {
    attachmentRequestStatus: ?number,
    deleteStack: Function,
    fetchDetails: Function,
    fetchFrame: Function,
    clearDetails: Function,
    update: Function,
    requestStatus: ?number,
    frame: ?{},
    listData?: {},
    data?: {},
    frameRequestStatus: ?number,
    loadingFrame?: boolean,
    currentUser?: string,
    currentUserToken?: string,
    updatePermissions: Function,
}

const categoryMap = {
    app: 'applications',
    mlModel: 'models',
};

const dataFormat = data => data?.head;

const Details = ({
    fetchDetails,
    fetchFrame,
    downloadAttachment,
    clearDetails,
    update,
    data = {},
    listData = {},
    frame,
    frameRequestStatus,
    loading,
    requestStatus,
    currentUser,
    currentUserToken,
    updatePermissions,
}: Props) => {
    let parsedAttachmentIndex;

    const params = useParams();
    const {push} = useHistory();
    const location = useLocation();
    const searchParams = parseSearch(location.search);
    const [hasUpdate, setHasUpdate] = useState(false);
    const [isCanceledUpdate, setIsCanceledUpdate] = useState(false);

    if (searchParams.a)
        parsedAttachmentIndex = parseInt(searchParams.a);

    const [attachmentIndex, setAttachmentIndex] = useState(parsedAttachmentIndex);
    const [selectedFrame, setSelectedFrame] = useState(searchParams.f);
    const [executionId, setExecutionId] = useState(searchParams['execution_id']);
    const [headId, setHeadId] = useState(null);

    const {t} = useTranslation();

    const [isShowUploadModal, setIsShowUploadModal] = useState(false);
    const isFirstChangeSearch = useRef(false);

    const downloadAttachmentHandle = () => {
        downloadAttachment(`${params.user}/${params.stack}`, selectedFrame || headId, attachmentIndex || 0);
    };

    const {data: headData} = useSWR([
        config.API_URL + config.STACK_HEAD(params.user, params.stack),
        dataFormat,
    ], dataFetcher, {
        revalidateOnMount: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        refreshInterval: (!loading && data && !hasUpdate && !isCanceledUpdate) ? 1000 : 0,
    });


    useEffect(() => {
        if (headData && headData.id !== data.head.id)
            setHasUpdate(true);
    }, [headData]);

    useEffect(() => {
        if (isFirstChangeSearch.current) {
            let parsedAttachmentIndex;

            if (searchParams.a)
                parsedAttachmentIndex = parseInt(searchParams.a);

            if (parsedAttachmentIndex !== attachmentIndex)
                setAttachmentIndex(parsedAttachmentIndex);

            if (searchParams.f !== selectedFrame)
                setSelectedFrame(searchParams.f);

            if (searchParams['execution_id'] !== executionId)
                setExecutionId(searchParams['execution_id']);

        } else {
            isFirstChangeSearch.current = true;
        }
    }, [location.search]);

    useEffect(() => {
        let searchParams = {};

        if (attachmentIndex)
            searchParams.a = attachmentIndex;

        if (selectedFrame && selectedFrame !== headId)
            searchParams.f = selectedFrame;

        if (executionId)
            searchParams['execution_id'] = executionId;

        const searchString = Object
            .keys(searchParams)
            .map(key => `${key}=${searchParams[key]}`)
            .join('&');

        if (location.search.replace('?', '') !== searchString)
            push({search: searchString.length ? `?${searchString}` : ''});
    }, [attachmentIndex, selectedFrame, executionId, headId]);

    const fetchData = () => {
        fetchDetails(params.user, params.stack);
    };

    useEffect(() => {
        if (!data.head || !listData || (data.head.id !== listData.head))
            fetchData();
    }, [params.user, params.stack]);

    useEffect(() => {
        return () => clearDetails();
    }, []);

    const setHeadFrame = frameId => {
        update({
            stack: `${data.user}/${data.name}`,
            noUpdateStore: true,
            head: frameId,
        }, () => setHeadId(frameId));
    };

    const onUpdateReadme = readme => {
        update({
            stack: `${data.user}/${data.name}`,
            readme,
        });
    };

    useEffect(() => {
        if (selectedFrame)
            fetchFrame(params.user, params.stack, selectedFrame);
    }, [selectedFrame]);

    useEffect(() => {
        if (data && data.head)
            setHeadId(data.head.id);
    }, [data]);

    const onChangeFrame = frameId => {
        setSelectedFrame(frameId);
        setAttachmentIndex(undefined);
        setExecutionId(undefined);
    };

    const toggleUploadModal = () => setIsShowUploadModal(!isShowUploadModal);

    const changeAccessLevel = accessLevel => {
        update({
            stack: `${data.user}/${data.name}`,
            'access_level': accessLevel,
        });
    };

    const refresh = () => {
        setHasUpdate(false);
        fetchData();
        setAttachmentIndex();
        setExecutionId();
    };

    const cancelUpdate = () => {
        setIsCanceledUpdate(true);
        setHasUpdate(false);
    };

    if (!loading && requestStatus === 403)
        return <AccessForbidden>
            {t('youDontHaveAnAccessToThisStack')}.

            {isSignedIn() && (
                <Fragment>
                    <br />

                    <Link to={routes.categoryStacks(params.category)}>
                        {t('goToMyStacks')}
                    </Link>
                </Fragment>
            )}
        </AccessForbidden>;

    if (!loading && (requestStatus === 404 || frameRequestStatus === 404))
        return <NotFound>
            {t('theStackYouAreRookingForCouldNotBeFound')}
            {' '}
            {isSignedIn() && (
                <Fragment>
                    <Link to={routes.categoryStacks(params.category)}>
                        {t('goToMyStacks')}
                    </Link>.
                </Fragment>
            )}
        </NotFound>;

    const currentFrameId = selectedFrame ? selectedFrame : get(data, 'head.id');

    const contentType = get(data, 'head.attachments[0].content_type');
    const application = get(data, 'head.attachments[0].application');

    const category = getStackCategory({
        application,
        contentType,
    });

    const DetailsComponent = category === 'app' ? StackDetailsApp : StackDetails;

    return (
        <Fragment>
            <Helmet>
                <title>dstack.ai | {params.user} | {params.stack}</title>
            </Helmet>

            <DetailsComponent
                loading={loading || params?.stack !== data?.name}
                currentFrameId={currentFrameId}
                frame={frame}
                attachmentIndex={attachmentIndex || 0}
                executionId={executionId}
                data={data}
                frameRequestStatus={frameRequestStatus}
                currentUser={currentUser}
                currentUserToken={currentUserToken}
                toggleUpload={toggleUploadModal}
                backUrl={routes.categoryStacks(categoryMap[category])}
                changeAccessLevel={changeAccessLevel}
                updatePermissions={updatePermissions}
                user={params.user}
                stack={params.stack}
                onUpdateReadme={onUpdateReadme}
                onChangeFrame={onChangeFrame}
                onChangeHeadFrame={setHeadFrame}
                onChangeExecutionId={setExecutionId}
                onChangeAttachmentIndex={setAttachmentIndex}
                downloadAttachment={downloadAttachmentHandle}
                configurePythonCommand={config.CONFIGURE_PYTHON_COMMAND(currentUserToken, currentUser)}
                configureRCommand={config.CONFIGURE_R_COMMAND(currentUserToken, currentUser)}
                updates={{
                    has: hasUpdate,
                    refreshAction: refresh,
                    cancelAction: cancelUpdate,
                }}
            />

            <StackUpload
                stack={params.stack}
                isShow={isShowUploadModal}
                onClose={() => setIsShowUploadModal(false)}
                refresh={fetchData}
                apiUrl={config.API_URL}
                user={params.user}
            />
        </Fragment>
    );
};

export default connect(
    (state, props) => {
        const frame = state.stacks.details.frame;
        const stack = `${props.match.params.user}/${props.match.params.stack}`;

        return {
            data: get(state.stacks.details.data, stack),
            listData: state.stacks.list.data && state.stacks.list.data.find(i => `${i.user}/${i.name}` === stack),
            requestStatus: state.stacks.details.requestStatus,
            frame,
            frameRequestStatus: state.stacks.details.frameRequestStatus,
            loadingFrame: state.stacks.details.loadingFrame,
            attachmentRequestStatus: state.stacks.details.attachmentRequestStatus,
            loading: state.stacks.details.loading,
            currentUser: state.app.userData?.user,
            currentUserToken: state.app.userData?.token,
        };
    },

    {
        fetchDetails,
        clearDetails,
        deleteStack,
        fetchFrame,
        update,
        downloadAttachment,
        updatePermissions,
    },
)(Details);
