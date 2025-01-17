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
import { useSearchParams as useNextSearchParams, ReadonlyURLSearchParams, useRouter } from "next/navigation";

const Main = () => {
  const [isSidebarExpanded, setSidebarExpanded] = useState(true);
  const APP_ID = process.env.NEXT_PUBLIC_APP_ID || "";
  const useSearchParams = isBrowser ? useNextSearchParams : () => new ReadonlyURLSearchParams();

  const searchParams = useSearchParams();
  const { authStates } = useSelector((state: RootState) => state.auth);
  const selectedAccount = useSelector((state: RootState) => state.selectedAccount);
  const dispatch = useDispatch();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const tokenMap = useRef<Record<number, string>>({});
  const reqIdCounter = useRef<number>(1); // Incremental ID for tracking requests
  const sentTokens = useRef<Set<string>>(new Set()); // Track sent tokens to prevent duplicates
  const router = useRouter();

  // useEffect(() => {
  //   const ws = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=67094`);

  //   ws.onopen = () => {
  //     setStatus("WebSocket connected.");

  //     if(authStates==null || authStates.length === 0) {
  //       console.log("authStates",authStates);
        
  //       // Send requests for tokens only if they haven't been sent before
  //     if (token1 && !sentTokens.current.has(token1)) {
  //       sendAuthRequest(ws, token1);
  //       sentTokens.current.add(token1); // Mark token1 as sent
  //     }
  //     if (token2 && !sentTokens.current.has(token2)) {
  //       sendAuthRequest(ws, token2);
  //       sentTokens.current.add(token2); // Mark token2 as sent
  //     }
  //     }
      
  //   };

  //   ws.onmessage = (event) => {
  //     const data = JSON.parse(event.data);

  //     if (data.error) {
  //       setStatus("Authorization failed.");
  //     } else if (data.authorize) {
  //       const token = tokenMap.current[data.req_id]; // Match the request ID to the token
  //       if (token) {
  //         setStatus("Authorization successful.");

  //         // Save token and loginid pairing
  //         dispatch(
  //           addAuthState({
  //             token: token, // The token from the original request
  //             loginid: data.authorize.loginid, // The login ID from the response
  //             balance: data.authorize.balance,
  //             currency: data.authorize.currency,
  //             is_virtual: data.authorize.is_virtual,
  //             userEmail: data.authorize.email,
  //           })
  //         );
  //       }
  //     }
  //   };

  //   ws.onclose = () => {
  //     setStatus("WebSocket disconnected.");
  //   };

  //   return () => {
  //     ws.close(); // Cleanup WebSocket on component unmount
  //   };
  // }, [token1, token2]);

  useEffect(() => {
    // Dynamically get all tokens from search params
    const allParams = Object.fromEntries(searchParams.entries());
    const tokens = Object.entries(allParams)
      .filter(([key]) => key.startsWith("token")) // Filter keys that start with "token"
      .map(([, value]) => value) // Extract the token values
      .filter(Boolean); // Ensure there are no falsy values

    // If no authStates or no tokens, redirect to login page
    if ((!authStates || authStates.length === 0) && tokens.length === 0) {
      router.push("/login");
      return;
    }

    // If authStates is empty, proceed with token-based authentication
    const ws = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${APP_ID}`);

    ws.onopen = () => {
      if (authStates == null || authStates.length === 0) {
        // Send requests for tokens dynamically
        tokens.forEach((token) => {
          if (!sentTokens.current.has(token)) {
            sendAuthRequest(ws, token);
            sentTokens.current.add(token); // Mark token as sent
          }
        });
      }
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.error) {
      } else if (data.authorize) {
        const token = tokens[0]; // Get the token from the first request (you can change this logic)
        if (token) {
          // Save token and loginid pairing
          dispatch(
            addAuthState({
              token: token,
              loginid: data.authorize.loginid,
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
    };

  }, [searchParams]);

  const sendAuthRequest = (ws: WebSocket, token: string) => {
    console.log(token);
    const req_id = reqIdCounter.current++;
    tokenMap.current[req_id] = token; // Map req_id to token
    const payload = { authorize: token, req_id };
    ws.send(JSON.stringify(payload));
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
  }, [authStates, selectedAccount]);

  // useEffect(() => {
  //   if(authStates==null || authStates.length==0) {
  //     if(token1==null || token2==null){
  //       router.push("/login");

  //     }
  //   }
  // },[]);


  return (
    <Suspense>
    <div className="bg-slate-200">
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
