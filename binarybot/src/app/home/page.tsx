"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useWebSocket } from "../contexts/WebSocketContext";

export default function Home() {
  const searchParams = useSearchParams();
  const { ws,sendMessage, lastMessage, isConnected, reconnect } = useWebSocket();
  const [responses, setResponses] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [status, setStatus] = useState<string>("Initializing...");
  const token1 = searchParams.get("token1");
  const token2 = searchParams.get("token2");

  const handleSendMessage = (token: string) => {
    if (!token) {
      console.warn("No token provided.");
      return;
    }

    if (isConnected) {
      sendMessage({ authorize: token });
    } else {
      // console.warn("WebSocket is not connected.");
    }
  };  



  useEffect(() => {
    const initializeWebSocket = async () => {
      if (!isConnected) {
        console.log("useEffect: WebSocket is not connected.");
        await reconnect();
      }
      if (token1) handleSendMessage(token1);
      if (token2) handleSendMessage(token2);
    };
  
    initializeWebSocket();
  }, [token1, token2, reconnect]);
  

  useEffect(() => {
    if (lastMessage === null) {
      console.log("No messages received yet.");
      setStatus("Waiting for messages...");
      return;
    }
  
    if (lastMessage.error) {
      setErrorMessage(lastMessage.error.message);
      setStatus("Authorization failed.");
      console.error("Authorization failed:", lastMessage.error.message);
    } else if (lastMessage.authorize) {
      setResponses((prev) => [...prev, lastMessage]);
      setStatus("Authorization successful.");
      console.log("Authorization successful:", lastMessage);
    }
  }, [lastMessage]);

  return (
    <div>
      <h1>Welcome!</h1>
      <h2>Status: {status}</h2>
      {errorMessage && <p style={{ color: "red" }}>Error: {errorMessage}</p>}
      <h3>WebSocket Responses:</h3>
      <ul>
        {responses.map((response, index) => (
          <li key={index}>
            <pre>{JSON.stringify(response, null, 2)}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
}
