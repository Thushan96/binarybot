"use client";

import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import Modal from "@/app/components/modal";
import deriv from "../deriv.png";
import aiTrader from "../aiTrader.png";
import { useDispatch, useSelector } from "react-redux";
import { clearUser, setUser } from "../redux/slices/userSlice";
import { RootState } from "../redux/store";
import { Account, clearAccounts, updateAccount } from "../redux/slices/accountsSlice";
import { addAuthState, clearAuthStates } from "../redux/slices/authSlice";
import { useRouter } from "next/navigation";
import { useWebSocket } from "../contexts/WebSocketContext";
import { clearSelectedAccount, setSelectedAccount } from "../redux/slices/selectedAccountSlice";

export default function Login() {
  const APP_ID=process.env.NEXT_PUBLIC_APP_ID;
  const [isModalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const [apiToken, setApiToken] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const auth = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const { ws, isConnected, sendMessage } = useWebSocket();

  interface UserData {
    email: string;
    currency: string;
    fullname: string;
    country: string;
    scopes: string[];
    accounts: Account[]; // Explicitly type accounts as an array of Account
  }

  const handleLogin = async () => {
    if (!apiToken) {
      setErrorMessage("Please enter an API token.");
      return;
    }
    dispatch(clearUser());
    dispatch(clearAuthStates());
    dispatch(clearSelectedAccount());
    dispatch(clearAccounts());

    setIsLoading(true);
    setErrorMessage("");

    // Send authorization message to WebSocket
    sendMessage({ authorize: apiToken });

    if (!ws) return;

    ws.onmessage = (message) => {
      const response = JSON.parse(message.data);
      if (response.error) {
        setErrorMessage("Invalid API token. Please try again.");
      } else {
        dispatch(addAuthState({
          token: apiToken,
          loginid: response.authorize.loginid,
          balance: response.authorize.balance,
          currency: response.authorize.currency,
          is_virtual: response.authorize.is_virtual,
          userEmail: response.authorize.email,
        }));

        dispatch(
          setSelectedAccount({
            loginid: response.loginid,
            currency: response.currency,
            balance: response.balance,
            token: response.token,
            is_virtual: response.is_virtual,
            userEmail: response.userEmail,
          })
        );
        
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
        
        
        router.push("/main");
      }

      setIsLoading(false);
    };

    ws.onerror = () => {
      setErrorMessage("An error occurred while connecting to the server.");
      setIsLoading(false);
    };
  };


  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: 'url("https://ryansechrest.com/content/images/2022/08/nodes.gif")',
      }}
    >
      <Head>
        <title>Login</title>
      </Head>
      <div
        className="flex flex-col md:flex-row items-center justify-between bg-white rounded-lg shadow-lg p-8 w-full max-w-5xl"
        style={{ width: "785px", height: "500px" }}
      >
        {/* Left Section */}
        <div className="md:w-1/2 flex flex-col items-center justify-center text-center p-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Free Binary Bot & Deriv Bot
          </h1>
          <p className="text-gray-600 mb-6">Click to start free AutoTrading</p>
          <Image width="150" height="80" src={deriv} alt="/" />
          <p className="text-sm mt-6 text-gray-600">
            Binary Bot and Deriv Bot auto trading platforms.
          </p>
          <p className="text-sm text-gray-600">Start your algorithmic trading journey today!</p>
          <button
            className="bg-red-600 mt-6 text-white py-2 px-4 rounded-md shadow-md hover:bg-red-700 w-full md:w-auto"
            onClick={() =>
                (window.location.href = "https://hub.deriv.com/tradershub/signup")
              }
          >
            NO TOKEN? CREATE AN ACCOUNT
          </button>
        </div>

        {/* Vertical Divider */}
        <div className="hidden md:block w-[1px] bg-gray-300 h-full mx-4"></div>

        {/* Right Section */}
        <div className="md:w-1/2 flex flex-col items-center justify-center text-center p-4">
          <div className="text-center md:w-1/2 rounded-lg p-6">
            <Image width="200" height="120" src={aiTrader} alt="/" />
          </div>
          <div className="flex flex-col items-center mb-6">
            <button
              className="flex items-center justify-center w-full py-2 px-4 bg-gray-800 text-white rounded-md hover:bg-gray-700"
              onClick={openModal}
            >
              LOGIN WITH{" "}
              <span className="ml-2 font-bold text-red-500">DERIV</span>
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
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Signing In...' : 'SIGN IN'}
        </button>
          </div>
        </div>
      </div>

      {/* Reusable Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Already have an account?">
        <p className="text-gray-600 mb-4">
          You already have an existing Deriv or Binary account?
        </p>
        <label className="flex items-center text-gray-600">
          <input
            type="checkbox"
            className="mr-2 border-gray-300 rounded"
          />
          Don't show this message again
        </label>
      </Modal>
    </div>
  );
}
