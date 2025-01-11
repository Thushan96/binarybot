import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import accountReducer from './slices/accountsSlice';
import authReducer from './slices/authSlice';
import selectedAccountReducer from './slices/selectedAccountSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    account:accountReducer,
    auth: authReducer,
    selectedAccount: selectedAccountReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
