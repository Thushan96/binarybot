import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { setSelectedAccount } from "../redux/slices/selectedAccountSlice";
import LiveChart from "../components/chart";
import { updateAuthStateByToken, updateAuthStateByLoginId } from "../redux/slices/authSlice";

interface DashboardProps {
  isSidebarExpanded: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ isSidebarExpanded }) => {
  const [tradeParams, setTradeParams] = useState<{
    contractType: "CALL" | "PUT";
    stake: number;
    duration: number;
    durationUnit: "m" | "h";
    symbol: string;
  }>({
    contractType: "CALL",
    stake: 10,
    duration: 5,
    durationUnit: "m",
    symbol: "R_100",
  });

  const [tradeAlert, setTradeAlert] = useState<string | null>(null);
  const selectedAccount = useSelector(
    (state: RootState) => state.selectedAccount
  );
  const wbs = useRef<WebSocket | null>(null);
  const { authStates } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const APP_ID = process.env.NEXT_PUBLIC_APP_ID || "";
  const isConnectedRef = useRef(false); // Holds the connection state immediately
  const [tradePlaced, setTradePlaced] = useState(false);
  const [disabled, setDisabled] = useState(true);

  const tradeTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const updateConnectionState = (value: boolean) => {
    isConnectedRef.current = value;
  };

  const connectWebSocket = async () => {
    console.log("Connecting WebSocket...");

    wbs.current = new WebSocket(
      `wss://ws.binaryws.com/websockets/v3?app_id=${APP_ID}`
    );

    wbs.current.onopen = () => {
      console.log("WebSocket connected");

      // Wait until WebSocket is open, then send the authentication request
      if (selectedAccount.token) {
        console.log("Sending authentication request...");
        wbs.current?.send(JSON.stringify({ authorize: selectedAccount.token }));
        setDisabled(false);
      } else {
        console.log("No token found in selected account. Reconnection failed.");
      }
    };

    wbs.current.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data?.authorize) {
          console.log("set is connected true");
          updateConnectionState(true);
        }
        console.log(data);
        if (data.buy) {
          console.log("buy data", data.buy);
          if (selectedAccount.token) {
            dispatch(
              setSelectedAccount({
                loginid: selectedAccount.loginid,
                currency: selectedAccount.currency,
                balance: data.buy.balance_after,
                token: selectedAccount.token,
                is_virtual: selectedAccount.is_virtual,
                userEmail: selectedAccount.userEmail,
              })
            );

            dispatch(
              updateAuthStateByToken({
                token: selectedAccount.token,
                updates: {
                  balance: data.buy.balance_after,
                },
              })
            );
          }
        } else if (data.sell) {
          console.log("sell data", data.sell);
          if (selectedAccount.token) {
            dispatch(
              setSelectedAccount({
                loginid: selectedAccount.loginid,
                currency: selectedAccount.currency,
                balance: data.sell.balance_after,
                token: selectedAccount.token,
                is_virtual: selectedAccount.is_virtual,
                userEmail: selectedAccount.userEmail,
              })
            );
            dispatch(
              updateAuthStateByToken({
                token: selectedAccount.token,
                updates: {
                  balance: data.buy.balance_after,
                },
              })
            );
          }
        } else if (data.balance) {
          const newBalance = data.balance.balance;
          const loginid = data.balance.loginid;
          if (selectedAccount.loginid === loginid) {
            dispatch(
              setSelectedAccount({
                balance: newBalance,
                loginid: selectedAccount.loginid,
                currency: selectedAccount.currency,
                token: selectedAccount.token,
                is_virtual: selectedAccount.is_virtual,
                userEmail: selectedAccount.userEmail,
              })
            );
          }

          dispatch(
            updateAuthStateByLoginId({
              loginid: loginid,
              updates: {
                balance: newBalance,
              },
            })
          );
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    wbs.current.onerror = (error) => {
      console.log(error);
    };

    wbs.current.onclose = () => {
      updateConnectionState(true);
      wbs.current = null;
      setDisabled(true);
    };
  };

  const sendMessage = (message: any) => {
    if (wbs.current && isConnectedRef.current) {
      wbs.current.send(JSON.stringify(message));
      setTradePlaced(true);
      // Reset the signal after marking
      setTimeout(() => setTradePlaced(false), 100);
    } else {
      console.warn("WebSocket not connected. Reconnecting...");
    }
  };

  const checkConnection = async () => {
    if (wbs.current == null) {
      await connectWebSocket();
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } else if (wbs.current && wbs.current.readyState !== WebSocket.OPEN) {
      await connectWebSocket();
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } else if (
      wbs.current &&
      wbs.current.readyState === WebSocket.OPEN &&
      !isConnectedRef.current
    ) {
      await connectWebSocket();
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  };

  const handleTrade = async () => {
    if (selectedAccount == null) {
      setTradeAlert("Please select an account for trade");
      return;
    }

    if (
      Number(selectedAccount.balance) <= 0 ||
      Number(selectedAccount.balance) < tradeParams.stake
    ) {
      setTradeAlert("Your account balance is insufficient. Please recharge your account");
      return;
    }

    await checkConnection();

    sendMessage({
      buy: 1,
      price: tradeParams.stake,
      parameters: {
        amount: tradeParams.stake,
        basis: "stake",
        contract_type: tradeParams.contractType,
        currency: authStates[0]?.currency || "USD",
        duration: tradeParams.duration,
        duration_unit: tradeParams.durationUnit,
        symbol: tradeParams.symbol,
      },
    });

    // Calculate trade duration in milliseconds
    const durationInMs =
      tradeParams.duration *
      (tradeParams.durationUnit === "m" ? 60000 : 3600000);

    setTradeAlert(`Trade placed with amount: $${tradeParams.stake}`);
    setTimeout(() => setTradeAlert(null), 2000); 

    // Store timeout for this trade
    const timeoutId = setTimeout(async () => {
      await checkConnection();
      if (wbs.current && isConnectedRef.current) {
        wbs.current.send(JSON.stringify({ balance: 1 }));
      } else {
        console.warn("WebSocket not connected for balance check.");
      }
    }, durationInMs);

    // Save timeoutId with a unique identifier for each trade
    tradeTimeouts.current.set(`${Date.now()}`, timeoutId);
  };

  return (
    <div className={`${isSidebarExpanded ? "ml-60" : "ml-14"}`}>
      {/* Trade Alert - Appears at the top of the page */}
      {tradeAlert && (
        <div
          className="fixed top-4 left-1/2 transform -translate-x-1/2 mt-4 p-4 bg-green-100 text-green-800 rounded border border-green-300 z-50"
          role="alert"
        >
          {tradeAlert}
          <button
            className="ml-2 text-green-600 hover:underline"
            onClick={() => setTradeAlert(null)}
          >
            Close
          </button>
        </div>
      )}

      <div className="flex justify-center items-center flex-col mt-8">
        <h1 className="text-center text-3xl font-bold mb-6 text-black">Live Market Data Chart</h1>
        <div className="flex justify-center items-center w-full">
          <LiveChart symbol="R_100" tradePlaced={tradePlaced} />
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8 bg-slate-200">
        <div className="bg-slate-200 shadow-md rounded-lg p-6 text-black">
          <div className="bg-slate-200 shadow-md rounded-lg p-6 mb-4">
            <h2 className="text-2xl font-semibold text-center mb-2">Place your trade</h2>
            <p className="text-lg text-center">Current Balance: ${selectedAccount.balance}</p>
          </div>

          {/* Form Section */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            {/* Contract Type */}
            <div>
              <label className="block text-sm font-medium mb-2">Contract Type</label>
              <select
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={tradeParams.contractType}
                onChange={(e) =>
                  setTradeParams((prev) => ({
                    ...prev,
                    contractType: e.target.value as "CALL" | "PUT",
                  }))
                }
              >
                <option value="CALL">CALL</option>
                <option value="PUT">PUT</option>
              </select>
            </div>

            {/* Symbol */}
            <div>
              <label className="block text-sm font-medium mb-2">Symbol</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={tradeParams.symbol}
                onChange={(e) =>
                  setTradeParams({ ...tradeParams, symbol: e.target.value })
                }
              />
            </div>

            {/* Stake */}
            <div>
              <label className="block text-sm font-medium mb-2">Stake</label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={tradeParams.stake}
                onChange={(e) =>
                  setTradeParams({
                    ...tradeParams,
                    stake: Number(e.target.value),
                  })
                }
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium mb-2">Duration</label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={tradeParams.duration}
                onChange={(e) =>
                  setTradeParams({
                    ...tradeParams,
                    duration: Number(e.target.value),
                  })
                }
              />
            </div>

            {/* Duration Unit */}
            <div>
              <label className="block text-sm font-medium mb-2">Duration Unit</label>
              <select
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={tradeParams.durationUnit}
                onChange={(e) =>
                  setTradeParams({
                    ...tradeParams,
                    durationUnit: e.target.value as "m" | "h",
                  })
                }
              >
                <option value="m">Minutes</option>
                <option value="h">Hours</option>
              </select>
            </div>

            {/* Place Trade Button */}
            <button
              className="w-full bg-blue-600 text-white py-2 px-4 rounded mt-6 hover:bg-blue-700 transition"
              onClick={handleTrade}
            >
              Place Trade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
