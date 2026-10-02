import { create } from 'zustand';
import api from '../services/api';
import { getSocket } from '../services/socket';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  initialize: () => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('agentflow_token');
    const storedUser = localStorage.getItem('agentflow_user');

    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        set({ token, user, isAuthenticated: true, isLoading: false });
        const socket = getSocket();
        if (socket && (user.id || user._id)) {
          socket.emit('join_user', user.id || user._id);
        }
        return;
      } catch (_) {}
    }

    set({ token: null, user: null, isAuthenticated: false, isLoading: false });
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;

      localStorage.setItem('agentflow_token', token);
      localStorage.setItem('agentflow_user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      const socket = getSocket();
      if (socket && (user.id || user._id)) {
        socket.emit('join_user', user.id || user._id);
      }

      return user;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  register: async (name, email, password, role = 'operator') => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      const { user, token } = response.data;

      localStorage.setItem('agentflow_token', token);
      localStorage.setItem('agentflow_user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      const socket = getSocket();
      if (socket && (user.id || user._id)) {
        socket.emit('join_user', user.id || user._id);
      }

      return user;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  fetchMe: async () => {
    try {
      const response = await api.get('/auth/me');
      const user = response.data;
      localStorage.setItem('agentflow_user', JSON.stringify(user));
      set({ user });
      return user;
    } catch (err) {
      console.warn('Failed to refresh user profile:', err.message);
    }
  },

  logout: () => {
    localStorage.removeItem('agentflow_token');
    localStorage.removeItem('agentflow_user');
    set({ user: null, token: null, isAuthenticated: false, isLoading: false, error: null });
  },

  clearError: () => set({ error: null })
}));
