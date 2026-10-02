import axios from 'axios';

const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    return '/api';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      config.baseURL = getBaseURL();
      const token = localStorage.getItem('agentflow_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = {
      message: error.response?.data?.error || error.message || 'A network error occurred',
      statusCode: error.response?.status,
      code: error.response?.data?.code || 'UNKNOWN_ERROR',
      details: error.response?.data?.errors || null
    };

    if (error.response?.status === 401 && typeof window !== 'undefined') {
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register') && window.location.pathname !== '/') {
        localStorage.removeItem('agentflow_token');
        localStorage.removeItem('agentflow_user');
        window.location.href = '/login?expired=true';
      }
    }

    return Promise.reject(customError);
  }
);

export default api;
