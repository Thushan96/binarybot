import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SelectedAccountState {
  loginid: string | null;
  currency: string | null;
  balance: string | null;
  token: string | null;
  is_virtual: boolean | null;
  userEmail: string | null;
}

const initialState: SelectedAccountState = {
  loginid: null,
  currency: null,
  balance: null,
  token: null,
  is_virtual: null,
  userEmail: null,
};

const selectedAccountSlice = createSlice({
  name: "selectedAccount",
  initialState,
  reducers: {
    setSelectedAccount: (
      state,
      action: PayloadAction<SelectedAccountState>
    ) => {
      state.loginid = action.payload.loginid;
      state.currency = action.payload.currency;
      state.balance = action.payload.balance;
      state.token = action.payload.token;
      state.is_virtual = action.payload.is_virtual;
      state.userEmail = action.payload.userEmail;
    },
    clearSelectedAccount: (state) => {
      state.loginid = null;
      state.currency = null;
      state.balance = null;
      state.token = null;
      state.is_virtual = null;
      state.userEmail = null;
    },
  },
});

export const { setSelectedAccount, clearSelectedAccount } =
  selectedAccountSlice.actions;
export default selectedAccountSlice.reducer;
