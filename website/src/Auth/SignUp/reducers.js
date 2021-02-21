import actionsTypes from './actionsTypes';
import _get from 'lodash/get';

const initial = {
    loading: false,
    errors: {},
};

export default (state = initial, action) => {
    switch (action.type) {
        case (actionsTypes.SIGN_UP):
            return {
                ...state,
                loading: true,
                errors: {},
            };

        case (actionsTypes.SIGN_UP_SUCCESS):
            return {
                ...state,
                loading: false,
            };

        case (actionsTypes.SIGN_UP_FAIL):
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
