"use client";

import Head from "next/head";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Modal from "@/app/components/modal";
import deriv from "../deriv.png";
import aiTrader from "../aiTrader.png";
import { useDispatch } from "react-redux";
import { clearUser, setUser } from "../redux/slices/userSlice";
import { Account, clearAccounts } from "../redux/slices/accountsSlice";
import { addAuthState, clearAuthStates } from "../redux/slices/authSlice";
import { useRouter } from "next/navigation";
import { clearSelectedAccount } from "../redux/slices/selectedAccountSlice";
import { useWebSocket } from "../contexts/WebSocketContext";

export default function Login() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [apiToken, setApiToken] = useState("");
  const apiTokenRef = useRef("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const dispatch = useDispatch();
  const router = useRouter();
  const wbs = useRef<WebSocket | null>(null);
  const { ws,disconnect } = useWebSocket(); // Access global WebSocket and disconnect method
  const APP_ID = process.env.NEXT_PUBLIC_APP_ID || "";
  const isComponentMounted = useRef(false); // Flag to track component mount status

  // Function to establish WebSocket connection for the Login page
  const connectWebSocket = () => {
    console.log("Connecting WebSocket...");
    
    // if (wbs.current) {
    //   wbs.current.close();
    // }

    wbs.current = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${APP_ID}`);

    wbs.current.onopen = () => {
      console.log("WebSocket connected");
    };

    wbs.current.onmessage = (message) => {
      const response = JSON.parse(message.data);

      if (response.error) {
        setErrorMessage("Invalid API token. Please try again.");
      } else {
        console.log("Received:", response);
        handleUserData(response);
      }

      setIsLoading(false);
    };

    wbs.current.onerror = (error) => {
      setIsLoading(false);
    };

    wbs.current.onclose = () => {
      console.log(" login WebSocket disconnected....");
    };
  };

  // Function to handle user data from API response
  const handleUserData = (response: any) => {
    const userData = {
      email: response.authorize.email,
      currency: response.authorize.currency,
      is_virtual: response.authorize.is_virtual,
      balance: response.authorize.balance,
      fullname: response.authorize.fullname,
      country: response.authorize.country,
      scopes: [],
      accounts: [] as Account[],
    };

    if (response.authorize.account_list && response.authorize.account_list.length > 0) {
      userData.accounts = []; // Initialize the array here
      response.authorize.account_list.map((account: Account) => {
        if (account.is_disabled === 0) {
          userData.accounts.push({
            account_category: account.account_category,
            account_type: account.account_type,
            broker: account.broker,
            created_at: account.created_at,
            currency: account.currency,
            currency_type: account.currency_type,
            is_disabled: account.is_disabled,
            is_virtual: account.is_virtual,
            landing_company_name: account.landing_company_name,
            loginid: account.loginid,
          });
        }
      });
    }

    dispatch(setUser(userData));
    dispatch(addAuthState({
      token: apiTokenRef.current,
      loginid: response.authorize.loginid,
      balance: response.authorize.balance,
      currency: response.authorize.currency,
      is_virtual: response.authorize.is_virtual,
      userEmail: response.authorize.email,
    }));
    router.push("/main");
  };

  // Handle login request
  const handleLogin = () => {
    if (!apiToken) {
      setErrorMessage("Please enter an API token.");
      return;
    }

    dispatch(clearUser());
    dispatch(clearAuthStates());
    dispatch(clearSelectedAccount());
    dispatch(clearAccounts());

    setIsLoading(true);
    sendMessage({ authorize: apiToken });
  };

  const sendMessage = (message: any) => {
    if (wbs.current && wbs.current.readyState === WebSocket.OPEN) {
      wbs.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket not connected. Reconnecting...");
      connectWebSocket();

      const waitForConnection = setInterval(() => {
        if (wbs.current && wbs.current.readyState === WebSocket.OPEN) {
          wbs.current.send(JSON.stringify(message));
          clearInterval(waitForConnection); // Stop checking once message is sent
        }
      }, 500); 
    }
  };

  useEffect(() => {
    apiTokenRef.current = apiToken;
  }, [apiToken]);

  useEffect(() => {
    // Disconnect the global WebSocket when navigating to the Login page
    if (ws && ws.readyState === WebSocket.OPEN) {
      disconnect();
    }

    // Connect the Login WebSocket
    connectWebSocket();

  }, []); // Empty dependency array to run once on component mount 

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: 'url("https://ryansechrest.com/content/images/2022/08/nodes.gif")' }}
    >
      <Head>
        <title>Login</title>
      </Head>
      <div
        className="flex flex-col md:flex-row items-center justify-between bg-white rounded-lg shadow-lg p-8 w-full max-w-5xl"
        style={{ width: "785px", height: "500px" }}
      >
        <div className="md:w-1/2 flex flex-col items-center justify-center text-center p-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Free Binary Bot & Deriv Bot</h1>
          <p className="text-gray-600 mb-6">Click to start free AutoTrading</p>
          <Image width="150" height="80" src={deriv} alt="/" />
          <p className="text-sm mt-6 text-gray-600">
            Binary Bot and Deriv Bot auto trading platforms.
          </p>
          <p className="text-sm text-gray-600">Start your algorithmic trading journey today!</p>
          <button
            className="bg-red-600 mt-6 text-white py-2 px-4 rounded-md shadow-md hover:bg-red-700 w-full md:w-auto"
            onClick={() => (window.location.href = "https://hub.deriv.com/tradershub/signup")}
          >
            NO TOKEN? CREATE AN ACCOUNT
          </button>
        </div>

        <div className="hidden md:block w-[1px] bg-gray-300 h-full mx-4"></div>

        <div className="md:w-1/2 flex flex-col items-center justify-center text-center p-4">
          <div className="text-center md:w-1/2 rounded-lg p-6">
            <Image width="200" height="120" src={aiTrader} alt="/" />
          </div>
          <div className="flex flex-col items-center mb-6">
            <button
              className="flex items-center justify-center w-full py-2 px-4 bg-gray-800 text-white rounded-md hover:bg-gray-700"
              onClick={() => setModalOpen(true)}
            >
              LOGIN WITH <span className="ml-2 font-bold text-red-500">DERIV</span>
            </button>
            <p className="text-gray-500 my-4">OR</p>
            <input
              type="text"
              placeholder="Enter API Token"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              className="text-black w-full border border-gray-300 rounded-md py-2 px-4 mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className={`w-full bg-gray-800 text-white py-2 px-4 rounded-md shadow-md hover:bg-gray-700 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Signing In..." : "SIGN IN"}
            </button>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Already have an account?">
        <p className="text-gray-600 mb-4">You already have an existing Deriv or Binary account?</p>
        <label className="flex items-center text-gray-600">
          <input type="checkbox" className="mr-2 border-gray-300 rounded" />
          Don&apos;t show this message again
        </label>
      </Modal>
    </div>
  );
}
