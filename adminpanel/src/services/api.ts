import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('thiqa_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('thiqa_token');
      localStorage.removeItem('thiqa_user');
      if (!window.location.pathname.includes('/signin')) {
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

export async function postForm<T>(url: string, formData: FormData) {
  return api.post<T>(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function getBlob(url: string) {
  return api.get<Blob>(url, { responseType: 'blob' });
}

export default api;
