import wsServer from './src/api_server/index'
import { httpServer } from "./src/http_server/index";

const HTTP_PORT = 8181;

console.log(`Static http server started on the port ${HTTP_PORT}`);
httpServer.listen(HTTP_PORT);

wsServer.on('listening', () => {
  console.log(`WebSocket server started on ws://${wsServer.options.host}:${wsServer.options.port}`);
});

wsServer.on('error', (error) => {
  console.error('WebSocket server error:', error);
});
