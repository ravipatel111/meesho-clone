import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://meeshoapis.onrender.com/api',
  withCredentials: true,
});

let storeRef = null;
export const injectStore = (store) => { storeRef = store; };

axiosInstance.interceptors.request.use((config) => {
  // Token is sent via HttpOnly cookie (withCredentials: true).
  // We also read from Redux state for APIs that still need Authorization header
  // (fallback for non-cookie environments).
  const token = storeRef?.getState()?.auth?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      storeRef?.dispatch({ type: 'auth/logout' });
    }
    return Promise.reject(err);
  }
);

export default axiosInstance;
