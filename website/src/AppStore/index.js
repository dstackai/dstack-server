import React, {createContext, useReducer, useContext} from 'react';
import actionsTypes from './actionsTypes';

export {default as actionsTypes} from './actionsTypes';

const initialState = {
    currentUser: {
        loading: false,
        data: null,
    },
    configInfo: {
        loading: false,
        data: null,
    },
    appProgress: {
        active: null,
        value: null,
    },
};

export const reducer = (state = initialState, action) => {
    switch (action.type) {
        case (actionsTypes.FETCH_CURRENT_USER):
            return {
                ...state,
                currentUser: {
                    ...state.currentUser,
                    loading: true,
                },
            };

        case (actionsTypes.FETCH_CURRENT_USER_SUCCESS):
            return {
                ...state,
                currentUser: {
                    ...state.currentUser,
                    data: action.payload,
                    loading: false,
                },
            };

        case (actionsTypes.FETCH_CURRENT_USER_FAIL):
            return {
                ...state,
                currentUser: {
                    ...state.currentUser,
                    loading: false,
                },
            };


        case (actionsTypes.FETCH_CONFIG_INFO):
            return {
                ...state,
                configInfo: {
                    ...state.configInfo,
                    loading: true,
                },
            };

        case (actionsTypes.FETCH_CONFIG_INFO_SUCCESS):
            return {
                ...state,
                configInfo: {
                    ...state.configInfo,
                    data: action.payload,
                    loading: false,
                },
            };

        case (actionsTypes.FETCH_CONFIG_INFO_FAIL):
            return {
                ...state,
                configInfo: {
                    ...state.configInfo,
                    loading: false,
                },
            };


        case (actionsTypes.START_PROGRESS):
            return {
                ...state,
                appProgress: {
                    ...state.appProgress,
                    active: true,
                    value: null,
                },
            };

        case (actionsTypes.SET_PROGRESS):
            return {
                ...state,
                appProgress: {
                    ...state.appProgress,
                    value: action.payload,
                },
            };

        case (actionsTypes.COMPLETE_PROGRESS):
            return {
                ...state,
                appProgress: {
                    ...state.appProgress,
                    active: false,
                    value: null,
                },
            };

        case (actionsTypes.RESET_PROGRESS):
            return {
                ...state,
                appProgress: {
                    ...state.appProgress,
                    active: null,
                    value: null,
                },
            };

        default:
            return state;
    }
};

export const StateContext = createContext();

export const AppStoreProvider = ({children, apiUrl}) => (
    <StateContext.Provider value={useReducer(reducer, {...initialState, apiUrl})}>
        {children}
    </StateContext.Provider>
);

export const useAppStore = () => useContext(StateContext);
