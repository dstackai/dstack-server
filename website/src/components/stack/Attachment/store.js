import React, {createContext, useReducer, useContext} from 'react';
import actionsTypes from './actionsTypes';

const initialState = {
    data: {},
    errors: {},
    requestStatus: null,
};

export const reducer = (state = initialState, action) => {
    switch (action.type) {
        case (actionsTypes.FETCH):
            return {
                ...state,
                data: {
                    ...state.data,
                    [action.meta.frameId]: {
                        ...state.data[action.meta.frameId],

                        [action.meta.id]: {
                            ...(
                                state.data[action.meta.frameId]
                                    ? state.data[action.meta.frameId][action.meta.id]
                                    : {}
                            ),

                            loading: true,
                            requestStatus: null,
                            error: null,
                        },
                    },
                },
            };

        case (actionsTypes.FETCH_SUCCESS):
            return {
                ...state,
                data: {
                    ...state.data,

                    [action.meta.frameId]: {
                        ...state.data[action.meta.frameId],

                        [action.meta.id]: {
                            ...action.payload,
                            loading: false,
                        },
                    },
                },
            };

        case (actionsTypes.FETCH_FAIL):
            return {
                ...state,

                data: {
                    ...state.data,
                    [action.meta.frameId]: {
                        ...state.data[action.meta.frameId],

                        [action.meta.id]: {
                            error: action.payload.error,
                            requestStatus: action.payload.requestStatus,
                            loading: false,
                        },
                    },
                },
            };

        default:
            return state;
    }
};

export const StateContext = createContext();

export const StateProvider = ({children, apiUrl}) => (
    <StateContext.Provider value={useReducer(reducer, {...initialState, apiUrl})}>
        {children}
    </StateContext.Provider>
);

export const useStateValue = () => useContext(StateContext);
