import actionsTypes from './actionsTypes';

const initial = {};

export default (state = initial, action) => {
    switch (action.type) {
        case (actionsTypes.UPDATE):
            return state;

        case (actionsTypes.UPDATE_SUCCESS):
            return state;

        case (actionsTypes.UPDATE_FAIL):
            return state;


        default:
            break;
    }

    return state;
};
