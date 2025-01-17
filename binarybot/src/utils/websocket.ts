const APP_ID = process.env.NEXT_PUBLIC_APP_ID || "";
export const socket = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${APP_ID}`); // Replace YOUR_APP_ID with your actual app ID

const pendingMessages: string[] = []; // Queue to store messages when the socket is not ready

// Ensure the socket processes pending messages once it opens
socket.onopen = () => {
  try {
    while (pendingMessages.length > 0) {
      const message = pendingMessages.shift();
      if (message) {
        socket.send(message);
      }
    }
  } catch (error) {
    console.error("Error while processing pending messages:", error);
  }
};

socket.onclose = () => {
  try {
    console.log("WebSocket connection closed.");
  } catch (error) {
    console.error("Error in WebSocket onclose handler:", error);
  }
};

socket.onerror = (error) => {
  try {
    console.error("WebSocket error:", error);
  } catch (innerError) {
    console.error("Error while handling WebSocket error:", innerError);
  }
};

// Utility function to send a message when the socket is ready
const sendMessage = (message: object) => {
  try {
    const serializedMessage = JSON.stringify(message);

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(serializedMessage);
    } else if (socket.readyState === WebSocket.CONNECTING) {
      pendingMessages.push(serializedMessage);
    } else {
      console.error("WebSocket is not open. Unable to send message.");
    }
  } catch (error) {
    console.error("Error while sending message:", error);
  }
};

// Subscribe to market data
export const subscribeToMarketData = (symbol: string, callback: (data: any) => void) => {
  try {
    const request = {
      ticks: symbol,
      subscribe: 1,
    };

    sendMessage(request);

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.tick) {
          callback(message.tick);
        }
      } catch (error) {
        console.error("Error while handling WebSocket message:", error);
      }
    };
  } catch (error) {
    console.error("Error while subscribing to market data:", error);
  }
};

// Unsubscribe from market data
export const unsubscribeFromMarketData = (symbol: string) => {
  try {
    const request = {
      ticks: symbol,
      unsubscribe: 1,
    };

    sendMessage(request);
  } catch (error) {
    console.error("Error while unsubscribing from market data:", error);
  }
};
