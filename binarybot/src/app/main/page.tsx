"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import SideNavbar from "../components/sideNavbar";
import TopBar from "../components/topBar";
import Dashboard from "../dashboard/dahsboard";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { addAuthState } from "../redux/slices/authSlice";
import { setSelectedAccount } from "../redux/slices/selectedAccountSlice";
import { isBrowser } from "is-in-browser";
import { useSearchParams as useNextSearchParams, ReadonlyURLSearchParams } from "next/navigation";

const Main = () => {
  const [isSidebarExpanded, setSidebarExpanded] = useState(true);

  const useSearchParams = isBrowser ? useNextSearchParams : () => new ReadonlyURLSearchParams();

  const searchParams = useSearchParams();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [status, setStatus] = useState<string>("Initializing...");


  const token1 = searchParams.get("token1");
  const token2 = searchParams.get("token2");
  const { authStates } = useSelector((state: RootState) => state.auth);
  const selectedAccount = useSelector((state: RootState) => state.selectedAccount);
  const dispatch = useDispatch();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const tokenMap = useRef<Record<number, string>>({});
  const reqIdCounter = useRef<number>(1); // Incremental ID for tracking requests

  useEffect(() => {
    const ws = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=67094`);
    setSocket(ws);

    ws.onopen = () => {
      setStatus("WebSocket connected.");
      
      if (token1) sendAuthRequest(ws, token1);
      if (token2) sendAuthRequest(ws, token2);
    }
      

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.error) {
        setStatus("Authorization failed.");
      } else if (data.authorize) {
        const token = tokenMap.current[data.req_id]; // Match the request ID to the token
        if (token) {
          setStatus("Authorization successful.");

          // Save token and loginid pairing
          dispatch(
            addAuthState({
              token: token, // The token from the original request
              loginid: data.authorize.loginid, // The login ID from the response
              balance: data.authorize.balance,
              currency: data.authorize.currency,
              is_virtual: data.authorize.is_virtual,
              userEmail: data.authorize.email,
            })
          );
        }
      }
    };

    ws.onclose = () => {
      setStatus("WebSocket disconnected.");
    };

    return () => {
      ws.close();
    };
  }, [token1, token2, dispatch]);

  const sendAuthRequest = (ws: WebSocket, token: string) => {
    const req_id = reqIdCounter.current++;
    tokenMap.current[req_id] = token; // Map req_id to token
    const payload = { authorize: token, req_id };
    ws.send(JSON.stringify(payload));
    console.log("Sent:", payload);
  };

  useEffect(() => {
    if (!selectedAccount.loginid && authStates.length > 0) {
      const defaultAccount = authStates[0];
      dispatch(
        setSelectedAccount({
          loginid: defaultAccount.loginid,
          currency: defaultAccount.currency,
          balance: defaultAccount.balance,
          token: defaultAccount.token,
          is_virtual: defaultAccount.is_virtual,
          userEmail: defaultAccount.userEmail,
        })
      );
    }
  }, [authStates, selectedAccount, dispatch]);


  return (
    <Suspense>
    <div className="bg-slate-300 h-screen">
      <SideNavbar isExpanded={isSidebarExpanded} setIsExpanded={setSidebarExpanded} />
      <div className={`transition-all duration-300 ${isSidebarExpanded ? "ml-30" : "ml-26"}`}>
        <TopBar isExpanded={isSidebarExpanded} />
          <Dashboard isSidebarExpanded={isSidebarExpanded} />
      </div>
    </div>
    </Suspense>
  );
};

export default Main;
