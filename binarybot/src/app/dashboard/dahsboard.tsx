"use client";
import React, { useEffect, useRef, useState } from "react";
import { useWebSocket } from "../contexts/WebSocketContext";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import {
  Container,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  Box,
  Card,
  CardContent,
  Alert,
  Grid,
} from "@mui/material";
import { setSelectedAccount } from "../redux/slices/selectedAccountSlice";

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
  const selectedAccount = useSelector((state: RootState) => state.selectedAccount);
  const wbs = useRef<WebSocket | null>(null);
  const { ws,disconnect } = useWebSocket(); // Access global WebSocket and disconnect method
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { authStates } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const APP_ID = process.env.NEXT_PUBLIC_APP_ID || "";
  const isConnectedRef = useRef(false); // Holds the connection state immediately

const updateConnectionState = (value: boolean) => {
  isConnectedRef.current = value;
  console.log("Updated isConnectedRef:", isConnectedRef.current);
};

    // Function to establish WebSocket connection for the Login page
    const connectWebSocket = async () => {
      console.log("Connecting WebSocket...");
  
      wbs.current = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${APP_ID}`);

      wbs.current.onopen = () => {
        console.log("WebSocket connected");
    
        // Wait until WebSocket is open, then send the authentication request
        if (selectedAccount.token) {
          console.log("Sending authentication request...");
          wbs.current?.send(JSON.stringify({ authorize: selectedAccount.token }));
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
            console.log("buy data",data.buy);
            
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
          } else if (data.sell) {
            console.log("sell data",data.sell);
            
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
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };
  
      wbs.current.onerror = (error) => {
        console.log(error);
        
        setIsLoading(false);
      };
  
      wbs.current.onclose = () => {
        console.log(" dashboard WebSocket disconnected....");
        updateConnectionState(true);
        wbs.current = null;

      };
    };

    const sendMessage = (message: any) => {
      if (wbs.current && isConnectedRef.current) {
        wbs.current.send(JSON.stringify(message));
      } else {
        console.warn("WebSocket not connected. Reconnecting...");
      }
    };
  

  const handleTrade = async () => {
    console.log("handle trade clicked");
    if(wbs.current==null) {
      console.log("wbs is null");
      
      console.log("WebSocket is not connected. Reconnecting...");
      await connectWebSocket();
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }else if (wbs.current && wbs.current.readyState !== WebSocket.OPEN ) {
        console.log("WebSocket is not connected. Reconnecting...");
        await connectWebSocket();
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }else if (wbs.current && wbs.current.readyState === WebSocket.OPEN && !isConnectedRef.current) {
        console.log("isConnected",isConnectedRef.current);
        console.log("WebSocket is connected. Authorization failed. Reconnecting...");
        await connectWebSocket();
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
        console.log("WebSocket is connected.");
        console.log(wbs);
        console.log(isConnectedRef.current);
        console.log(tradeParams.contractType);
        
        
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

    setTradeAlert(`Trade placed with amount: $${tradeParams.stake}`);
    setTimeout(() => setTradeAlert(null), 2000); // Auto-dismiss alert after 5 seconds
  };

  return (
    <div className={`bg-slate-300 transition-all duration-300 ${isSidebarExpanded ? "ml-60" : "ml-14"}`}>
      <Container maxWidth="sm">
        <Box mt={4} mb={4}>
          <Card>
            <CardContent>
              <Typography variant="h4" align="center" gutterBottom>
                Place your trade
              </Typography>
              <Typography variant="h5" align="center" sx={{ mt: 2 }}>
                Current Balance: ${selectedAccount.balance}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Make a Trade
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body1">Contract Type</Typography>
                <Select
                  fullWidth
                  value={tradeParams.contractType}
                  onChange={(e) => setTradeParams((prev) => ({
                    ...prev,
                    contractType: e.target.value as "CALL" | "PUT",
                  }))}                >
                  <MenuItem value="CALL">CALL</MenuItem>
                  <MenuItem value="PUT">PUT</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Stake"
                  type="number"
                  value={tradeParams.stake}
                  onChange={(e) => setTradeParams({ ...tradeParams, stake: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Duration"
                  type="number"
                  value={tradeParams.duration}
                  onChange={(e) => setTradeParams({ ...tradeParams, duration: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">Duration Unit</Typography>
                <Select
                  fullWidth
                  value={tradeParams.durationUnit}
                  onChange={(e) => setTradeParams({ ...tradeParams, durationUnit: e.target.value as "m" | "h" })}
                >
                  <MenuItem value="m">Minutes</MenuItem>
                  <MenuItem value="h">Hours</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={6} mt={3}>
                <TextField
                  fullWidth
                  label="Symbol"
                  value={tradeParams.symbol}
                  onChange={(e) => setTradeParams({ ...tradeParams, symbol: e.target.value })}
                />
              </Grid>
            </Grid>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleTrade}
            >
              Place Trade
            </Button>
          </CardContent>
        </Card>

        {tradeAlert && (
          <Alert severity="success" sx={{ mt: 2 }} onClose={() => setTradeAlert(null)}>
            {tradeAlert}
          </Alert>
        )}
      </Container>  
    </div>
  );
};

export default Dashboard;
