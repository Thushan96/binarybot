// utils/websocket.ts
export let socket = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${process.env.NEXT_PUBLIC_APP_ID || ""}`);

const RECONNECT_INTERVAL = 5000; // Interval between reconnection attempts (in ms)
const MAX_RETRIES = 5; // Max number of reconnection attempts

let reconnectAttempts = 0; // Counter for reconnection attempts
const pendingMessages: string[] = []; // Queue to store messages when socket is not ready

// Send a message when socket is ready
const sendMessage = (message: object) => {
  try {
    const serializedMessage = JSON.stringify(message);

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(serializedMessage);
    } else if (socket.readyState === WebSocket.CONNECTING) {
      pendingMessages.push(serializedMessage);
    } else {
      console.log("WebSocket is not open. Unable to send message.");
    }
  } catch (error) {
    console.log("Error while sending message:", error);
  }
};

// Handle reconnection attempts
const reconnectWebSocket = () => {
  if (reconnectAttempts < MAX_RETRIES) {
    reconnectAttempts++;
    console.log(`Reconnecting WebSocket... Attempt ${reconnectAttempts}`);
    setTimeout(() => {
      socket = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${process.env.NEXT_PUBLIC_APP_ID}`);
    }, RECONNECT_INTERVAL * reconnectAttempts);
  } else {
    console.log("Max reconnection attempts reached. Please check your connection.");
  }
};

socket.onopen = () => {
  console.log("WebSocket connected.");
  reconnectAttempts = 0;

  // Send any pending messages
  while (pendingMessages.length > 0) {
    const message = pendingMessages.shift();
    if (message) {
      socket.send(message);
    }
  }
};

socket.onmessage = (event) => {
  try {
    const message = JSON.parse(event.data);
    if (message.tick) {
      console.log("Market Data:", message.tick);
    }
  } catch (error) {
    console.log("Error while handling WebSocket message:", error);
  }
};

socket.onerror = (error) => {
  console.log("WebSocket error:", error);
};

socket.onclose = () => {
  console.log("WebSocket connection closed.");
  reconnectWebSocket();
};

// Subscribe to market data
export const subscribeToMarketData = (symbol: string, callback: (data: any) => void) => {
  try {
    const request = { ticks: symbol, subscribe: 1 };
    sendMessage(request);

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.tick) {
          callback(message.tick);
        }
      } catch (error) {
        console.log("Error while handling WebSocket message:", error);
      }
    };
  } catch (error) {
    console.log("Error subscribing to market data:", error);
  }
};

// Unsubscribe from market data
export const unsubscribeFromMarketData = (symbol: string) => {
  try {
    const request = { ticks: symbol, unsubscribe: 1 };
    sendMessage(request);
  } catch (error) {
    console.log("Error unsubscribing from market data:", error);
  }
};
