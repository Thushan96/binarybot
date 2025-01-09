import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  userEmail: string | null;
}

const initialState: AuthState = {
  token: null,
  userEmail: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
      login: (state, action: PayloadAction<{ token: string; userEmail: string }>) => {
        state.token = action.payload.token;
        state.userEmail = action.payload.userEmail; // Make sure this is set to action.payload.userEmail correctly
      },
      logout: (state) => {
        state.token = null;
        state.userEmail = null;
      },
    },
  });

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
