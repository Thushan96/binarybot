"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useWebSocket } from "../contexts/WebSocketContext";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { addAuthState } from "../redux/slices/authSlice";

export default function Home() {
  const searchParams = useSearchParams();
  const { ws,sendMessage, lastMessage, isConnected, reconnect } = useWebSocket();
  const [responses, setResponses] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [status, setStatus] = useState<string>("Initializing...");
  const token1 = searchParams.get("token1");
  const token2 = searchParams.get("token2");
  const user = useSelector((state: RootState) => state.user);
  const { authStates } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

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
  }, [token1, token2]);
  
  const handleSendMessage = (token: string) => {
    if (!token) {
      console.warn("No token provided.");
      return;
    }
    sendMessage({ authorize: token });
  };
  

  useEffect(() => {
    console.log("inside last message");

    if(lastMessage){
      if (lastMessage.error) {
        setErrorMessage(lastMessage.error.message);
        setStatus("Authorization failed.");
        console.error("Authorization failed:", lastMessage.error.message);
      } else if (lastMessage.authorize) {
        setResponses((prev) => [...prev, lastMessage]);
        setStatus("Authorization successful.");
        console.log("Authorization successful:", lastMessage);
        dispatch(addAuthState({
          token: lastMessage.authorize.api_token,
          loginid: lastMessage.authorize.loginid,
          balance: lastMessage.authorize.balance,
          currency: lastMessage.authorize.currency,
          is_virtual: lastMessage.authorize.is_virtual,
          userEmail: lastMessage.authorize.email,
        }));
        
      }
    }
    
    
  }, [lastMessage]);

  return (
    <div>
      <h1>Welcome!</h1>
      <h2>Status: {status}</h2>
      {errorMessage && <p style={{ color: 'red' }}>Error: {errorMessage}</p>}
      <h3>WebSocket Responses:</h3>
      <ul>
        {responses.map((response, index) => (
          <li key={index}>
            <pre>{JSON.stringify(response, null, 2)}</pre>
          </li>
        ))}
      </ul>
      <h3>Auth States:</h3>
      <ul>
        {authStates.map((authState, index) => (
          <li key={index}>
            <p>Login ID: {authState.loginid}</p>
            <p>Balance: {authState.balance}</p>
            <p>Currency: {authState.currency}</p>
            <p>Is Virtual: {authState.is_virtual ? 'Yes' : 'No'}</p>
            <p>Email: {authState.userEmail}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

