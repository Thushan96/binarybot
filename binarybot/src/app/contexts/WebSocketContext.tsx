"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";

interface WebSocketContextProps {
  ws: WebSocket | null;
  isConnected: boolean;
  sendMessage: (message: object) => Promise<void>;
  lastMessage: any;
  reconnect: () => Promise<void>;
}

interface WebSocketProviderProps {
  children: React.ReactNode;
  appId: string;
}

const WebSocketContext = createContext<WebSocketContextProps | undefined>(undefined);

// Utility to create a WebSocket connection with promises
const connectWebSocketWithPromise = (url: string): Promise<WebSocket> => {
  return new Promise((resolve, reject) => {
    const newWs = new WebSocket(url);

    newWs.onopen = () => {
      console.log("WebSocket connected.");
      resolve(newWs);
    };

    newWs.onerror = (error) => {
      console.error("WebSocket connection error:", error);
      reject(error);
    };

    newWs.onclose = (event) => {
      console.warn("WebSocket closed:", event.reason || "Unknown reason");
    };
  });
};

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children, appId }) => {
  const wsRef = useRef<WebSocket | null>(null); // Ref to track WebSocket instance
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);

  // Connect WebSocket
  const connectWebSocket = useCallback(async () => {
    if (wsRef.current) {
      console.log("WebSocket is already connected.");
      return;
    }
  
    try {
      const newWs = await connectWebSocketWithPromise(`wss://ws.binaryws.com/websockets/v3?app_id=${appId}`);
      wsRef.current = newWs;
      setIsConnected(true);
  
      newWs.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Message received:", data);
          setLastMessage(data);
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };
  
      newWs.onclose = (event) => {
        setIsConnected(false);
        wsRef.current = null;
        console.warn("WebSocket closed:", event.reason || "Unknown reason");
        setLastMessage(null);
      };
  
      newWs.onerror = (error) => {
        console.error("WebSocket Error:", error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
    }
  }, [appId]);
  

  const reconnectAttemptRef = useRef(false);

  const reconnect = useCallback(async () => {
    if (reconnectAttemptRef.current || isConnected) {
      console.log("Reconnection already in progress or WebSocket is connected.");
      return;
    }
    reconnectAttemptRef.current = true;
    console.log("Reconnecting WebSocket...");
    try {
      await connectWebSocket();
    } finally {
      reconnectAttemptRef.current = false;
    }
  }, [isConnected, connectWebSocket]);

  // Send a message through WebSocket
  const sendMessage = useCallback(
    async (message: object) => {
      if (wsRef.current && isConnected) {
        try {
          wsRef.current.send(JSON.stringify(message));
          console.log("Message sent:", message);
        } catch (error) {
          console.error("Error sending message:", error);
        }
      } else {
        console.warn("WebSocket is not connected.");
      }
    },
    [isConnected]
  );

  // Initialize WebSocket connection
  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connectWebSocket]);

  return (
    <WebSocketContext.Provider value={{ ws: wsRef.current, isConnected, sendMessage, lastMessage, reconnect }}>
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
