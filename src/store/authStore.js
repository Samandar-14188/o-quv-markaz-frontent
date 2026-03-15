import { create } from 'zustand';
import api from '../api/axios';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  isAuth: !!localStorage.getItem('accessToken'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      console.log('Login urinish:', email, password);
      const { data } = await api.post('/auth/login', { email, password });
      console.log('Login muvaffaqiyat:', data);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, isAuth: true, loading: false });
      return true;
    } catch (err) {
      console.log('Login xato:', err);
      set({ error: err.response?.data?.message || 'Xato', loading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.clear();
    set({ user: null, isAuth: false });
  },
}));

export default useAuthStore;