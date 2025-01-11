"use client";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useWebSocket } from "../contexts/WebSocketContext";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { addAuthState } from "../redux/slices/authSlice";
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
  const searchParams = useSearchParams();
  const { sendMessage, lastMessage, isConnected, reconnect } = useWebSocket();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [status, setStatus] = useState<string>("Initializing...");
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [tradeParams, setTradeParams] = useState({
    contractType: "CALL", // or "PUT"
    stake: 10,
    duration: 5,
    durationUnit: "m",
    symbol: "R_100",
  });
  const [tradeAlert, setTradeAlert] = useState<string | null>(null);
  const selectedAccount = useSelector((state: RootState) => state.selectedAccount);

  const { authStates } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const handleSendMessage = (token: string) => {
    sendMessage({ authorize: token });
  };

  useEffect(() => {
    const initializeWebSocket = async () => {
      if (!isConnected) {
        console.log("WebSocket is not connected. Reconnecting...");
        await reconnect();
      }
      if (selectedAccount && selectedAccount.token) {
        handleSendMessage(selectedAccount.token);
      }
    };

    initializeWebSocket();
  }, [selectedAccount]);

  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.error) {
        setErrorMessage(lastMessage.error.message);
        setStatus("Authorization failed.");
      } else if (lastMessage.buy) {
        dispatch(
          setSelectedAccount({
            loginid: selectedAccount.loginid,
            currency: selectedAccount.currency,
            balance: lastMessage.buy.balance_after,
            token: selectedAccount.token,
            is_virtual: selectedAccount.is_virtual,
            userEmail: selectedAccount.userEmail,
          })
        );
      } else if (lastMessage.sell) {
        dispatch(
          setSelectedAccount({
            loginid: selectedAccount.loginid,
            currency: selectedAccount.currency,
            balance: lastMessage.sell.balance_after, // Correct property access
            token: selectedAccount.token,
            is_virtual: selectedAccount.is_virtual,
            userEmail: selectedAccount.userEmail,
          })
        );
      }
    }
  }, [lastMessage, dispatch]);
  

  const handleTrade = async () => {
    console.log("handle trade clicked");
    if (!isConnected) {
      console.log("WebSocket is not connected. Reconnecting...");
      await reconnect();
    }

    if (selectedAccount.token) {
      await handleSendMessage(selectedAccount.token);//issue in here
    }else{
      console.log("please select an account");
      
    }

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
                  onChange={(e) => setTradeParams({ ...tradeParams, contractType: e.target.value })}
                >
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
                  onChange={(e) => setTradeParams({ ...tradeParams, durationUnit: e.target.value })}
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
