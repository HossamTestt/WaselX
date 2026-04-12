/**
 * Auth Store — Zustand
 * Manages user authentication state, login/logout/register
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true, // While checking stored auth

  /**
   * Bootstrap — check stored tokens on app launch
   */
  initialize: async () => {
    try {
      const [accessToken, refreshToken, userStr] = await AsyncStorage.multiGet([
        'accessToken', 'refreshToken', 'user',
      ]);
      if (accessToken[1] && userStr[1]) {
        set({
          accessToken: accessToken[1],
          refreshToken: refreshToken[1],
          user: JSON.parse(userStr[1]),
          isAuthenticated: true,
        });
      }
    } catch (e) {
      console.error('Auth init error:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Register new user
   */
  register: async (data) => {
    const res = await authAPI.register(data);
    const { user, accessToken, refreshToken } = res.data.data;
    await AsyncStorage.multiSet([
      ['accessToken', accessToken],
      ['refreshToken', refreshToken],
      ['user', JSON.stringify(user)],
    ]);
    set({ user, accessToken, refreshToken, isAuthenticated: true });
    return user;
  },

  /**
   * Login existing user
   */
  login: async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { user, accessToken, refreshToken } = res.data.data;
    await AsyncStorage.multiSet([
      ['accessToken', accessToken],
      ['refreshToken', refreshToken],
      ['user', JSON.stringify(user)],
    ]);
    set({ user, accessToken, refreshToken, isAuthenticated: true });
    return user;
  },

  /**
   * Logout — clear all stored tokens
   */
  logout: async () => {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },

  /**
   * Update stored user data (after profile edit)
   */
  updateUser: async (updates) => {
    const updated = { ...get().user, ...updates };
    await AsyncStorage.setItem('user', JSON.stringify(updated));
    set({ user: updated });
  },
}));

export default useAuthStore;
