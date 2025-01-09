import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Account {
  account_category: string;
  account_type: string;
  broker: string;
  created_at: number;
  currency: string;
  currency_type: string;
  is_disabled: number;
  is_virtual: number;
  landing_company_name: string;
  loginid: string;
}

interface AccountsState {
  accounts: Account[];  // Array to store multiple accounts
}

const initialState: AccountsState = {
  accounts: [],
};

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    setAccounts: (state, action: PayloadAction<Account[]>) => {
      state.accounts = action.payload;  // Set the entire accounts array
    },
    addAccount: (state, action: PayloadAction<Account>) => {
      state.accounts.push(action.payload);  // Add a new account to the array
    },
    updateAccount: (state, action: PayloadAction<Account>) => {
      const index = state.accounts.findIndex(account => account.loginid === action.payload.loginid);
      if (index !== -1) {
        state.accounts[index] = action.payload;  // Update the existing account
      }
    },
    removeAccount: (state, action: PayloadAction<string>) => {
      state.accounts = state.accounts.filter(account => account.loginid !== action.payload);  // Remove account by loginid
    },
    clearAccounts: (state) => {
      state.accounts = [];  // Clear all accounts
    },
  },
});

export const { setAccounts, addAccount, updateAccount, removeAccount, clearAccounts } = accountsSlice.actions;
export default accountsSlice.reducer;
