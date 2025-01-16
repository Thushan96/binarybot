"use client";

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
import { isBrowser } from "is-in-browser";
import { useSearchParams as useNextSearchParams, ReadonlyURLSearchParams } from "next/navigation";

export default function Home() {
  const useSearchParams = isBrowser ? useNextSearchParams : () => new ReadonlyURLSearchParams();
  const searchParams = useSearchParams();
  const { sendMessage, lastMessage, isConnected, reconnect } = useWebSocket();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [status, setStatus] = useState<string>("Initializing...");
  const [tradeResult, setTradeResult] = useState<string | null>(null);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [tradeParams, setTradeParams] = useState({
    contractType: "CALL", // or "PUT"
    stake: 10,
    duration: 5,
    durationUnit: "m",
    symbol: "R_100",
  });

  const token1 = searchParams.get("token2");
  const { authStates } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  

  // useEffect(() => {
  //   const initializeWebSocket = async () => {
  //     if (!isConnected) {
  //       console.log("WebSocket is not connected. Reconnecting...");
  //       await reconnect();
  //     }
  //     if (token1) handleSendMessage(token1);
  //   };

  //   initializeWebSocket();
  // }, [token1]);

  const handleSendMessage = (token: string) => {
    sendMessage({ authorize: token });
  };

  // useEffect(() => {
  //   if (lastMessage) {
  //     if (lastMessage.error) {
  //       setErrorMessage(lastMessage.error.message);
  //       setStatus("Authorization failed.");
  //     } else if (lastMessage.authorize) {
  //       setStatus("Authorization successful.");
  //       setCurrentBalance(lastMessage.authorize.balance);
  //       dispatch(
  //         addAuthState({
  //           token: lastMessage.authorize.api_token,
  //           loginid: lastMessage.authorize.loginid,
  //           balance: lastMessage.authorize.balance,
  //           currency: lastMessage.authorize.currency,
  //           is_virtual: lastMessage.authorize.is_virtual,
  //           userEmail: lastMessage.authorize.email,
  //         })
  //       );
  //     } else if (lastMessage.buy) {
  //       const profitLoss = lastMessage.buy.payout - lastMessage.buy.buy_price;
  //       setTradeResult(profitLoss > 0 ? `Profit: $${profitLoss}` : `Loss: $${-profitLoss}`);
  //       setCurrentBalance(lastMessage.buy.balance_after);
  //     }
  //   }
  // }, [lastMessage, dispatch]);

  const handleTrade = () => {
    console.log("handle trade clicked");
    
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
  };

  return (
    <Container maxWidth="sm">
      <Box mt={4} mb={4}>
        <Card>
          <CardContent>
            <Typography variant="h4" align="center" gutterBottom>
              Trade UI
            </Typography>
            <Typography variant="h6" align="center">
              Status: {status}
            </Typography>
            {errorMessage && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Error: {errorMessage}
              </Alert>
            )}
            <Typography variant="h5" align="center" sx={{ mt: 2 }}>
              Current Balance: ${currentBalance.toFixed(2)}
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
            <Grid item xs={6}>
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

      {tradeResult && (
        <Alert severity={tradeResult.includes("Profit") ? "success" : "warning"} sx={{ mt: 4 }}>
          {tradeResult}
        </Alert>
      )}
    </Container>
  );
}
