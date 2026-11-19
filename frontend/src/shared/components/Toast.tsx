import { useEffect } from 'react';
import { useNotificationStore } from '@/store/notificationStore';

export default function Toast() {
  const message = useNotificationStore((state) => state.message);
  const visible = useNotificationStore((state) => state.visible);
  const kind = useNotificationStore((state) => state.kind);
  const hideNotification = useNotificationStore((state) => state.hideNotification);

  useEffect(() => {
    if (!visible) return undefined;
    const timeout = window.setTimeout(hideNotification, 3000);
    return () => window.clearTimeout(timeout);
  }, [visible, message, hideNotification]);

  if (!visible || !message) return null;

  const appearance = {
    success: 'border-emerald-500 bg-emerald-50 text-emerald-900',
    error: 'border-red-500 bg-red-50 text-red-900',
    info: 'border-sky-500 bg-sky-50 text-sky-900',
  }[kind];

  return (
    <div className={`fixed right-5 top-5 z-[100] max-w-sm rounded-xl border-l-4 px-5 py-4 text-sm font-medium shadow-lg ${appearance}`} role="status" aria-live="polite">
      <div className="flex items-start justify-between gap-4">
        <span>{message}</span>
        <button type="button" className="font-bold" aria-label="Cerrar notificación" onClick={hideNotification}>×</button>
      </div>
    </div>
  );
}
