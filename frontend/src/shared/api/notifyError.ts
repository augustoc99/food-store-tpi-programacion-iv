import { useNotificationStore } from '@/store/notificationStore';

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Ocurrió un error inesperado.';
}

export function notifyApiError(error: unknown): void {
  const message = getErrorMessage(error);
  // Los 403 ya son notificados centralmente por setupInterceptors.
  if (message.toLowerCase() !== 'acceso denegado') {
    useNotificationStore.getState().showNotification(message, 'error');
  }
}
