import WebSocket from "ws";

class CustomWebSocket extends WebSocket {
  id: number;

  constructor(
    url: string,
    protocols?: string | string[],
    options?: WebSocket.ClientOptions
  ) {
    super(url, protocols, options);
  }
}

export { CustomWebSocket };
