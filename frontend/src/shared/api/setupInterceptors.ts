import axios from 'axios';
import { api } from './api';
import { useAuthStore } from '@/store/authStore';

type Detail = { detail?: string | { msg?: string }[] };
let setup = false;
export function setupInterceptors() {
  if (setup) return;
  setup = true;
  api.interceptors.response.use((r) => r, (error: unknown) => {
    if (!axios.isAxiosError<Detail>(error)) return Promise.reject(error);
    const url = error.config?.url ?? '';
    const status = error.response?.status;
    const publicAuth = ['/auth/token', '/auth/me', '/auth/register'].some((r) => url.includes(r));
    if (status === 401 && !publicAuth) useAuthStore.getState().clearSession();
    if (status === 400 && error.response?.data?.detail === 'Cuenta de usuario desactivada')
      useAuthStore.getState().clearSession();
    const detail = error.response?.data?.detail;
    const message = typeof detail === 'string' ? detail : Array.isArray(detail)
      ? detail.map((e) => e.msg ?? 'Error de validación').join('; ')
      : error.response ? `Error HTTP ${status}` : 'No se pudo conectar con el backend';
    return Promise.reject(new Error(message));
  });
}
