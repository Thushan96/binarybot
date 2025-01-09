import { combineReducers } from 'redux';
import userReducer from './slices/userSlice';
import accountsReducer from './slices/accountsSlice';
import authReducer from './slices/authSlice';

const rootReducer = combineReducers({
    user: userReducer,
    accounts: accountsReducer,
    auth: authReducer,
});

export default rootReducer;
