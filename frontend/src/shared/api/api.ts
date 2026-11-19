import axios from 'axios';

export const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1').replace(/\/$/, ''),
  timeout: 10_000,
  withCredentials: true,
});

// La autenticación viaja exclusivamente en la cookie HttpOnly del backend.
api.interceptors.request.use((config) => {
  config.headers.set('Accept', 'application/json');
  return config;
});
