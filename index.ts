import wsServer from './src/api_server/index'
import { httpServer } from "./src/http_server/index";

const HTTP_PORT = 8181;
const WS_PORT = 3000;


console.log(`Start static http server on the port ${HTTP_PORT} !`);
httpServer.listen(HTTP_PORT);

wsServer.on('listening', () => {
  console.log(`WebSocket server started on port ${WS_PORT}!`);
});

wsServer.on('error', (error) => {
  console.error('WebSocket server error:', error);
});
