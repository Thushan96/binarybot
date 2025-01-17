// lib/websocket.ts
const APP_ID = process.env.NEXT_PUBLIC_APP_ID || "";
export const socket = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${APP_ID}`); // Replace YOUR_APP_ID with your actual app ID

export const subscribeToMarketData = (symbol: string, callback: (data: any) => void) => {
  socket.onopen = () => {
    // Subscribe to market data for the specified symbol (e.g., ticks)
    const request = {
      ticks: symbol,
      subscribe: 1,
    };
    socket.send(JSON.stringify(request));
  };

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.tick) {
      callback(message.tick);
    }
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  socket.onclose = () => {
    console.log('WebSocket connection closed');
  };
};

export const unsubscribeFromMarketData = (symbol: string) => {
  const request = {
    ticks: symbol,
    unsubscribe: 1,
  };
  socket.send(JSON.stringify(request));
};
