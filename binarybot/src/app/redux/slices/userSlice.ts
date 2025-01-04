import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  email: string | null;
  loginid: string | null;
  is_virtual: number | null;
  currency: string | null;
  country: string | null;
  balance: number | null;
  scopes: string[];
  msg_type: string | null;
}

const initialState: UserState = {
  email: null,
  loginid: null,
  is_virtual: null,
  currency: null,
  country: null,
  balance: null,
  scopes: [],
  msg_type: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      return action.payload;
    },
    clearUser: () => initialState,
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
