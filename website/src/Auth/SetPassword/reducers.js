import actionsTypes from './actionsTypes';
import _get from 'lodash/get';

const initial = {
    loading: false,
    errors: {},
};

export default (state = initial, action) => {
    switch (action.type) {
        case (actionsTypes.UPDATE_PASSWORD):
            return {
                ...state,
                loading: true,
                errors: {},
            };

        case (actionsTypes.UPDATE_PASSWORD_SUCCESS):
            return {
                ...state,
                loading: false,
            };

        case (actionsTypes.UPDATE_PASSWORD_FAIL):
            return {
                ...state,
                loading: false,
                errors: _get(action, 'payload.errors'),
            };

        default:
            break;
    }

    return state;
};
