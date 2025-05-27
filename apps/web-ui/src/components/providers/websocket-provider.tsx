'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './auth-provider';
import { wsManager } from '@/lib/websocket';
import { WebSocketMessage, StatusUpdateMessage, LogMessage } from '@/types/api';

interface WebSocketContextType {
  isConnected: boolean;
  connectionState: string;
  connect: () => void;
  disconnect: () => void;
  addMessageHandler: (handler: (message: WebSocketMessage) => void) => () => void;
  addStatusUpdateHandler: (handler: (message: StatusUpdateMessage) => void) => () => void;
  addLogHandler: (handler: (message: LogMessage) => void) => () => void;
  subscribeToResource: (resourceType: string, resourceId: string) => void;
  unsubscribeFromResource: (resourceType: string, resourceId: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function useWebSocket() {
  const context = useContext(WebSocketContext);

  // Handle SSG/SSR case where context might not be available
  if (context === undefined) {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      // Return a default context for SSG/SSR
      return {
        isConnected: false,
        connectionState: 'disconnected',
        connect: () => {},
        disconnect: () => {},
        addMessageHandler: () => () => {},
        addStatusUpdateHandler: () => () => {},
        addLogHandler: () => () => {},
        subscribeToResource: () => {},
        unsubscribeFromResource: () => {},
      };
    }
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState('disconnected');

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      connect();
    } else if (!isAuthenticated) {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    // Monitor connection state
    const interval = setInterval(() => {
      const state = wsManager.getConnectionState();
      setConnectionState(state);
      setIsConnected(state === 'connected');
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const connect = () => {
    wsManager.connect();
  };

  const disconnect = () => {
    wsManager.disconnect();
  };

  const addMessageHandler = (handler: (message: WebSocketMessage) => void) => {
    return wsManager.addMessageHandler(handler);
  };

  const addStatusUpdateHandler = (handler: (message: StatusUpdateMessage) => void) => {
    return wsManager.addStatusUpdateHandler(handler);
  };

  const addLogHandler = (handler: (message: LogMessage) => void) => {
    return wsManager.addLogHandler(handler);
  };

  const subscribeToResource = (resourceType: string, resourceId: string) => {
    wsManager.subscribeToResource(resourceType, resourceId);
  };

  const unsubscribeFromResource = (resourceType: string, resourceId: string) => {
    wsManager.unsubscribeFromResource(resourceType, resourceId);
  };

  const value: WebSocketContextType = {
    isConnected,
    connectionState,
    connect,
    disconnect,
    addMessageHandler,
    addStatusUpdateHandler,
    addLogHandler,
    subscribeToResource,
    unsubscribeFromResource,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}
