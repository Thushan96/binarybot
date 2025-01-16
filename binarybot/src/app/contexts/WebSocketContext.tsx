"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";


interface WebSocketContextProps {
  ws: WebSocket | null;
  isConnected: boolean;
  sendMessage: (message: object) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lastMessage: any;
  reconnect: () => Promise<void>;
  disableWebSocket?: boolean;
  disconnect: () => void;
}

interface WebSocketProviderProps {
  children: React.ReactNode;
  appId: string;
  disableWebSocket?: boolean; // ✅ Add this line
}

const WebSocketContext = createContext<WebSocketContextProps | undefined>(undefined);

// Utility to create a WebSocket connection with promises
export const connectWebSocketWithPromise = (url: string): Promise<WebSocket> => {
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


export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children, appId ,disableWebSocket = false }) => {
  const wsRef = useRef<WebSocket | null>(null); // Ref to track WebSocket instance
  const [isConnected, setIsConnected] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [lastMessage, setLastMessage] = useState<any>(null);
  const messageQueue = useRef<object[]>([]); // Queue to hold messages until WebSocket is connected
  const selectedAccount = useSelector((state: RootState) => state.selectedAccount);

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      setIsConnected(false);
      wsRef.current = null; // Clear reference
      setLastMessage(null);
    }
  };

  // Connect WebSocket
  const connectWebSocket = useCallback(async () => {
    if (disableWebSocket) {
      console.log("Global WebSocket is disabled on this page.");
      return;
    }

    if (wsRef.current && isConnected) {
      console.warn("WebSocket already connected.");
      return;
    }

    try {
      console.log("Establishing new WebSocket connection...");
      const newWs = await connectWebSocketWithPromise(`wss://ws.binaryws.com/websockets/v3?app_id=${appId}`);
      wsRef.current = newWs;
      console.log(selectedAccount);
      
      if(selectedAccount.token){
        wsRef.current.send(JSON.stringify({ authorize : selectedAccount.token}));
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }else{
        console.log("No token found in selected Account reconnection failed");
      }

      // Attach a single onmessage handler
      newWs.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data?.authorize?.msg_type === "authorize") {
            setIsConnected(true);
            return;
          }    
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
    async (message: object) => {
      try {
      if (wsRef.current && isConnected) {          
          wsRef.current.send(JSON.stringify(message));
      } else if(!wsRef.current) {
        connectWebSocket();
        await new Promise((resolve) => setTimeout(resolve, 4000));
        if (wsRef.current && isConnected) {
          (wsRef.current as WebSocket).send(JSON.stringify(message));
        } else {
          console.warn("WebSocket is not connected. Queuing message.");        
          messageQueue.current.push(message); // Queue the message
        }
      }else if(!isConnected) {
        connectWebSocket();
        await new Promise((resolve) => setTimeout(resolve, 4000));
        if (wsRef.current && isConnected) {
          (wsRef.current as WebSocket).send(JSON.stringify(message));
        } else {
          console.warn("WebSocket is not connected. Queuing message.");        
          messageQueue.current.push(message); // Queue the message
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
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
    <WebSocketContext.Provider value={{ ws: wsRef.current, isConnected, sendMessage, lastMessage, reconnect ,disconnect }}>
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
