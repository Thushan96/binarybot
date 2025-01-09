"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface WebSocketContextProps {
  ws: WebSocket | null;
  isConnected: boolean;
  sendMessage: (message: object) => void;
}

interface WebSocketProviderProps {
  children: React.ReactNode;
  appId: string;
}

const WebSocketContext = createContext<WebSocketContextProps | undefined>(undefined);

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children, appId }) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newWs = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${appId}`);
    setWs(newWs);

    newWs.onopen = () => {
      setIsConnected(true);
    };

    newWs.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      if (newWs) {
        newWs.close();
      }
    };
  }, [appId]);

  const sendMessage = (message: object) => {
    if (ws && isConnected) {
      ws.send(JSON.stringify(message));
    }
  };

  return (
    <WebSocketContext.Provider value={{ ws, isConnected, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
