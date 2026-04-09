import React, { createContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Convert http to ws for socket.io
    const socketUrl = baseUrl?.replace('http', 'ws') || 'ws://localhost:4000';
    
    const socketInstance = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('Connected to socket server');
      socketInstance.emit('join-admin');
    });

    socketInstance.on('new-order', (order) => {
      setNotifications((prev) => [...prev, {
        id: Date.now(),
        type: 'new-order',
        message: `New order from ${order.customer} - ₹${order.amount}`,
        order: order,
        timestamp: new Date(),
      }]);
    });

    socketInstance.on('order-updated', (data) => {
      setNotifications((prev) => [...prev, {
        id: Date.now(),
        type: 'order-update',
        message: `Order ${data.orderId.slice(-8)} status changed to ${data.status}`,
        data: data,
        timestamp: new Date(),
      }]);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [baseUrl]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <SocketContext.Provider value={{ socket, notifications, clearNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};
