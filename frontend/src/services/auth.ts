import api from './api';

export const auth = {
  async login(email: string, password: string) {
    try {
      const response = await api.post('/login', { Email: email, Password: password });
      const token = response.data.token;
      if (token) {
        localStorage.setItem('authToken', token);
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }
};