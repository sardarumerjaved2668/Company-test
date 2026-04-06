import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

/** Browser: use absolute backend URL when set (CORS + avoids rewrite issues). Server/SSR: keep /api. */
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const u = process.env.NEXT_PUBLIC_API_URL;
    if (u && String(u).trim()) {
      config.baseURL = `${String(u).replace(/\/$/, '')}/api`;
    } else {
      config.baseURL = '/api';
    }
  }
  return config;
});

// Attach JWT from localStorage if available and not already set
api.interceptors.request.use(
  (config) => {
    if (!config.headers?.Authorization) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auto-refresh on TOKEN_EXPIRED
let isRefreshing = false;
let queue = [];
const drain = (err, token) => { queue.forEach((p) => err ? p.reject(err) : p.resolve(token)); queue = []; };

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const orig = error.config;
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !orig._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => queue.push({ resolve, reject }))
          .then((token) => { orig.headers['Authorization'] = `Bearer ${token}`; return api(orig); });
      }
      orig._retry = true;
      isRefreshing = true;
      try {
        const { data } = await api.post('/auth/refresh');
        api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        localStorage.setItem('accessToken', data.accessToken);
        orig.headers['Authorization'] = `Bearer ${data.accessToken}`;
        drain(null, data.accessToken);
        return api(orig);
      } catch (e) {
        drain(e, null);
        localStorage.removeItem('accessToken');
        try {
          sessionStorage.setItem('nexusai:openAuth', 'signin');
        } catch {
          /* ignore */
        }
        window.location.href = '/';
        return Promise.reject(e);
      } finally { isRefreshing = false; }
    }
    return Promise.reject(error);
  }
);

export default api;
