import { combineReducers } from 'redux';
import userReducer from './slices/userSlice';
import accountsReducer from './slices/accountsSlice';
import authReducer from './slices/authSlice';
import selectedAccountReducer from './slices/selectedAccountSlice';

const rootReducer = combineReducers({
    user: userReducer,
    accounts: accountsReducer,
    auth: authReducer,
    selectedAccount: selectedAccountReducer,
});

export default rootReducer;
