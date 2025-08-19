import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

let socket: Socket | null = null;

export interface Notification {
  type: string;
  payload: any;
}

export const useNotifications = (userId: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!userId) return;

    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_WS_URL || '');
    }

    socket.emit('register', userId);

    const handle = (type: string) => (payload: any) => {
      setNotifications((prev) => [...prev, { type, payload }]);
      toast(`${type}`, {
        description: typeof payload === 'object' ? JSON.stringify(payload) : undefined,
      });
    };

    const events = ['property:update', 'message:new', 'payment:status'];
    events.forEach((e) => socket!.on(e, handle(e)));

    return () => {
      events.forEach((e) => socket!.off(e));
    };
  }, [userId]);

  return {
    notifications,
    unread: notifications.length,
  };
};

export const NotificationBadge = ({ count }: { count: number }) => {
  if (!count) return null;
  return (
    <span
      data-testid="notification-badge"
      className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white"
    >
      {count}
    </span>
  );
};
