import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { setAccounts, addAccount, updateAccount, removeAccount, clearAccounts } from './accountsSlice';

interface UserState {
  email: string | null;
  fullname: string | null;
  is_virtual: number | null;
  currency: string | null;
  balance: number | null;
  scopes: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  accounts: any[];
}

const initialState: UserState = {
  email: null,
  fullname: null,
  is_virtual: null,
  currency: null,
  balance: null, 
  scopes: [],
  accounts: [],  
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      return action.payload;  // Set the entire user state
    },
    clearUser: () => initialState,  // Clear user data
  },
  extraReducers: (builder) => {
    builder
      // Integrate accounts actions into userSlice
      .addCase(setAccounts, (state, action) => {
        state.accounts = action.payload;  // Set accounts from the accounts slice
      })
      .addCase(addAccount, (state, action) => {
        state.accounts.push(action.payload);  // Add new account
      })
      .addCase(updateAccount, (state, action) => {
        const index = state.accounts.findIndex(account => account.loginid === action.payload.loginid);
        if (index !== -1) {
          state.accounts[index] = action.payload;  // Update account in userSlice
        }
      })
      .addCase(removeAccount, (state, action) => {
        state.accounts = state.accounts.filter(account => account.loginid !== action.payload);  // Remove account
      })
      .addCase(clearAccounts, (state) => {
        state.accounts = [];  // Clear accounts in userSlice
      });
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
