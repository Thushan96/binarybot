import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string;
  loginid: string;
  balance: string;
  currency: string;
  is_virtual: boolean;
  userEmail: string;
}

interface AuthStateArray {
  authStates: AuthState[]; // Array of AuthState objects
}

const initialState: AuthStateArray = {
  authStates: [], // Initialize as an empty array
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    addAuthState: (state, action: PayloadAction<AuthState>) => {
      // Add a new AuthState object to the array
      state.authStates.push(action.payload);
    },
    removeAuthState: (state, action: PayloadAction<string>) => {
      // Remove an AuthState object by loginid
      state.authStates = state.authStates.filter((auth) => auth.loginid !== action.payload);
    },
    updateAuthState: (state, action: PayloadAction<AuthState>) => {
      // Find and update an existing AuthState object by loginid
      const index = state.authStates.findIndex((auth) => auth.loginid === action.payload.loginid);
      if (index !== -1) {
        state.authStates[index] = action.payload;
      }
    },
    clearAuthStates: (state) => {
      // Clear all AuthState objects from the array
      state.authStates = [];
    },
  },
});

export const { addAuthState, removeAuthState, updateAuthState, clearAuthStates } = authSlice.actions;
export default authSlice.reducer;
