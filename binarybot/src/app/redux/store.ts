import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import accountReducer from './slices/accountsSlice';
import authReducer from './slices/authSlice';
import selectedAccountReducer from './slices/selectedAccountSlice';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // This uses localStorage by default

// Create a persist configuration for each reducer you want to persist
// const persistConfig = {
//   key: 'root',
//   storage,
// };

const authPersistConfig = {
  key: 'auth',
  storage,
};

const selectedAccountPersistConfig = {
  key: 'selectedAccount',
  storage,
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedSelectedAccountReducer = persistReducer(
  selectedAccountPersistConfig,
  selectedAccountReducer
);

// // Apply persistReducer to the selectedAccount reducer
// const persistedSelectedAccountReducer = persistReducer(persistConfig, selectedAccountReducer);
// const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    user: userReducer,
    account: accountReducer,
    auth: persistedAuthReducer,
    selectedAccount: persistedSelectedAccountReducer, // Use persisted version here
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST','persist/REHYDRATE'], // Ignore only 'persist/PERSIST', not 'persist/REHYDRATE'
        ignoredPaths: ['persist'], // Ignore the persist state paths as well
      },
    }),
});

// Create a persistor to sync redux-persist with your store
export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
