"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";

interface WebSocketContextProps {
  ws: WebSocket | null;
  isConnected: boolean;
  sendMessage: (message: object) => void;
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
  const messageQueue = useRef<object[]>([]); // Queue to hold messages until WebSocket is connected

  // Connect WebSocket
  const connectWebSocket = useCallback(async () => {
    if (wsRef.current) {
      console.warn("WebSocket already connected.");
      return;
    }

    try {
      console.log("Establishing new WebSocket connection...");
      const newWs = await connectWebSocketWithPromise(`wss://ws.binaryws.com/websockets/v3?app_id=${appId}`);
      wsRef.current = newWs;
      setIsConnected(true);

      // Attach a single onmessage handler
      newWs.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);    
          console.log(data);
                
          setLastMessage(data);
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      if (messageQueue.current.length > 0) {
        console.log("Sending queued messages...");
        while (messageQueue.current.length > 0) {
          const message = messageQueue.current.shift(); // Remove message from the queue
          if (message) {
            newWs.send(JSON.stringify(message));
            console.log("Queued message sent:", message);
          }
        }
      }

      // Handle WebSocket closure
      newWs.onclose = (event) => {
        console.warn("WebSocket closed:", event.reason || "Unknown reason");
        setIsConnected(false);
        wsRef.current = null; // Clear reference
        setLastMessage(null);
      };

      // Handle WebSocket errors
      newWs.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
    }
  }, [appId]);

  // Reconnect WebSocket
  const reconnect = useCallback(async () => {
    if (!isConnected) {
      console.log("Reconnecting WebSocket...");
      await connectWebSocket();
    }
  }, [isConnected, connectWebSocket]);

  // Send a message through WebSocket
  const sendMessage = useCallback(
    (message: object) => {
      if (wsRef.current && isConnected) {
        try {          
          wsRef.current.send(JSON.stringify(message));
        } catch (error) {
          console.error("Error sending message:", error);
        }
      } else {
        console.warn("WebSocket is not connected. Queuing message.");        
        messageQueue.current.push(message); // Queue the message
      }
    },
    [isConnected]
  );

  // Initialize WebSocket connection
  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        console.log("Cleaning up WebSocket connection...");
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
