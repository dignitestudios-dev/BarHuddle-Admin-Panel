import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getCookie, setCookie, eraseCookie } from '../utils';

export interface User {
  id: string | number;
  name: string;
  email: string;
  role?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isInitialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    initializeAuth: (state) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken') || getCookie('authToken');
        let user: User | null = null;
        try {
          const userStr = localStorage.getItem('authUser');
          user = userStr ? JSON.parse(userStr) : null;
        } catch {
          user = null;
        }

        if (token) {
          state.token = token;
          state.user = user;
          state.isAuthenticated = true;
          // Synchronize token between localStorage and cookies
          if (!getCookie('authToken')) {
            setCookie('authToken', token, 7);
          }
          if (!localStorage.getItem('authToken')) {
            localStorage.setItem('authToken', token);
          }
        } else {
          state.token = null;
          state.user = null;
          state.isAuthenticated = false;
        }
      }
      state.isInitialized = true;
    },
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = Boolean(token);
      state.isInitialized = true;
      if (typeof window !== 'undefined') {
        if (token) {
          localStorage.setItem('authToken', token);
          setCookie('authToken', token, 7);
        }
        if (user) {
          localStorage.setItem('authUser', JSON.stringify(user));
        }
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('resetToken');
        localStorage.removeItem('authUser');
        eraseCookie('authToken');
        eraseCookie('resetToken');
      }
    },
  },
});

export const { initializeAuth, setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;