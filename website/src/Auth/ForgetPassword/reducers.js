import actionsTypes from './actionsTypes';
import {get as _get} from 'lodash-es';

const initial = {
    loading: false,
    errors: {},
};

export default (state = initial, action) => {
    switch (action.type) {
        case (actionsTypes.RESET_PASSWORD):
            return {
                ...state,
                loading: true,
                errors: {},
            };

        case (actionsTypes.RESET_PASSWORD_SUCCESS):
            return {
                ...state,
                loading: false,
            };

        case (actionsTypes.RESET_PASSWORD_FAIL):
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
