'use client';

import { useSession } from 'next-auth/react';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

// Define the shape of the notification data
interface Notification {
  type: string;
  chat_id: string;
  message: string;
  sender: string;
  email: string; // sender_email
}

// Define the context type
interface NotificationContextType {
  socket: WebSocket | null;
  notifications: Notification[];
}

// Create the context
const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

// WebSocket base URL
const WS_BASE_URL =
`${process.env.WEBSOCKET_URL_PREFIX}/ws/notifications/`;

// Reconnection settings
const RECONNECT_INTERVAL = 5000; // 5 seconds
const MAX_RECONNECT_ATTEMPTS = 10;

// Provider props
interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const { data: session }: any = useSession();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const connectWebSocket = (email: string) => {
    if (!email) {
      console.log('Skipping WebSocket connection: No email available');
      return;
    }

    const wsUrl = `${WS_BASE_URL}${encodeURIComponent(email)}/`;
    console.log('Connecting to WebSocket:', wsUrl);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Notification WebSocket connected');
      setSocket(ws);
      setReconnectAttempts(0);
    };

    ws.onmessage = (event) => {
      const data: Notification = JSON.parse(event.data);
      if (data.type === 'notification') {
        setNotifications((prev) => [...prev, data]);
        console.log(
          `New notification: ${data.message} from ${data.sender} (${data.email}) in chat ${data.chat_id}`
        );
      }
    };

    ws.onclose = (event) => {
      console.log(
        `Notification WebSocket disconnected with code ${event.code}`
      );
      setSocket(null);
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS && event.code !== 4004) {
        setTimeout(() => {
          console.log(`Reconnecting... Attempt ${reconnectAttempts + 1}`);
          setReconnectAttempts((prev) => prev + 1);
          connectWebSocket(email);
        }, RECONNECT_INTERVAL);
      } else {
        console.error(
          `Max reconnection attempts reached or invalid email (code: ${event.code})`
        );
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      ws.close();
    };
  };

  useEffect(() => {
    if (session?.user?.email) {
      connectWebSocket(session.user.email);
    } else {
      console.log('No session or email, skipping WebSocket connection');
    }

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [session?.user?.email]);

  return (
    <NotificationContext.Provider value={{ socket, notifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use the NotificationContext
export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotification must be used within a NotificationProvider'
    );
  }
  return context;
};
