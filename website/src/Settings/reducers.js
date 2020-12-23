import {combineReducers} from 'redux';
import accountReducers from './Account/reducers';

export default combineReducers({account: accountReducers});
