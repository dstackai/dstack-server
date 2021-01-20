import actionsTypes from './actionsTypes';

const initial = {
    loading: false,
    loadingAttachment: false,
    error: null,
    frame: null,
    requestStatus: null,
    isPendingAddPermissions: false,
};

export default (state = initial, action) => {
    switch (action.type) {
        case (actionsTypes.FETCH):
            return {
                ...state,
                loading: true,
                error: null,
                requestStatus: null,
            };

        case (actionsTypes.FETCH_SUCCESS):
            return {
                ...state,
                loading: false,

                data: {
                    ...state.data,
                    [`${action.meta.stack}`]: action.payload,
                },

                loadingFrame: false,
                frameError: null,
                frame: action.payload.head,
            };

        case (actionsTypes.FETCH_FAIL):
            return {
                ...state,
                loading: false,
                error: action.payload.error,
                requestStatus: action.payload.requestStatus,
            };


        case (actionsTypes.UPDATE):
            return {
                ...state,

                data: {
                    ...state.data,
                    [`${action.meta.stack}`]: {
                        ...state.data[`${action.meta.stack}`],
                        ...action.payload,
                    },
                },
            };

        case (actionsTypes.UPDATE_SUCCESS):
            return state;

        case (actionsTypes.UPDATE_FAIL):
            return {
                ...state,

                data: {
                    ...state.data,
                    [`${action.meta.stack}`]: action.payload.data,
                },
            };


        case (actionsTypes.CLEAR_DETAILS):
            return {
                ...state,
                error: null,
                requestStatus: null,
                frameError: null,
                frameRequestStatus: null,
                loading: false,
                loadingAttachment: false,
                isPendingAddPermissions: false,
                data: {},
            };


        case (actionsTypes.UPDATE_PERMISSIONS):
            return {
                ...state,

                data: {
                    ...state.data,

                    [`${action.meta.stack}`]: {
                        ...state.data[`${action.meta.stack}`],
                        permissions: action.payload,
                    },
                },
            };


        case (actionsTypes.CREATE_COMMENT):
            return state;

        case (actionsTypes.CREATE_COMMENT_SUCCESS):
            return {
                ...state,

                data: {
                    ...state.data,
                    [`${action.meta.stack}`]: {
                        ...state.data[`${action.meta.stack}`],

                        comments: [
                            ...state.data[`${action.meta.stack}`].comments,
                            action.payload,
                        ],
                    },
                },
            };

        case (actionsTypes.CREATE_COMMENT_FAIL):
            return state;


        case (actionsTypes.FETCH_FRAME):
            return {
                ...state,
                loadingFrame: true,
                frame: null,
                frameError: null,
            };

        case (actionsTypes.FETCH_FRAME_SUCCESS):
            return {
                ...state,
                loadingFrame: false,
                frameError: null,
                frame: action.payload,
            };

        case (actionsTypes.FETCH_FRAME_FAIL):
            return {
                ...state,
                loadingFrame: false,
                frameError: action.payload.error,
                frameRequestStatus: action.payload.requestStatus,
            };

        default:
            break;
    }

    return state;
};
