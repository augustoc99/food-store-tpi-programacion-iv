import { useMutation } from '@tanstack/react-query';
import { api } from '@/shared/api/api';
import { notifyApiError } from '@/shared/api/notifyError';
import { useNotificationStore } from '@/store/notificationStore';
import { useAuthStore } from '../store/authStore';
import type { RegisterInput, User } from '../types/auth.types';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  const registerMutation = useMutation({
    mutationFn: async (input: RegisterInput) => (
      await api.post<User>('/auth/register', input)
    ).data,
    onSuccess: () => {
      useNotificationStore.getState().showNotification('Cuenta creada correctamente.', 'success');
    },
    onError: notifyApiError,
  });

  return {
    user,
    status,
    loading,
    error,
    login,
    logout,
    checkAuth,
    register: registerMutation.mutateAsync,
    registering: registerMutation.isPending,
  };
}
