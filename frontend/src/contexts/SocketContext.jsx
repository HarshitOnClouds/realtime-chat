'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import socketService from '@/lib/socket';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Map());

  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      const s = socketService.connect(user.id);
      setSocket(s);

      // Listen for user status changes
      socketService.onUserStatusChange((data) => {
        setOnlineUsers((prev) => {
          const newMap = new Map(prev);
          if (data.status === 'online') {
            newMap.set(data.userId, true);
          } else {
            newMap.delete(data.userId);
          }
          return newMap;
        });
      });

      return () => {
        socketService.disconnect();
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};