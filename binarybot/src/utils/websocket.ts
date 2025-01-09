let ws: WebSocket | null = null;

export const getWebSocket = (appId: string): WebSocket => {
  if (!ws || ws.readyState === WebSocket.CLOSED) {
    ws = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${appId}`);
  }
  return ws;
};

export const closeWebSocket = () => {
  if (ws) {
    ws.close();
    ws = null;
  }
};
