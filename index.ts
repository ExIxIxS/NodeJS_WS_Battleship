import wsServer from './src/api_server/index'
import { HTTP_PORT } from './src/constants/ports';
import { httpServer } from "./src/http_server/index";
import { getServerMessageDatedTitle } from './src/utils/messages';

console.log(`[APP INFO] Static http server started on the port ${HTTP_PORT}`);
httpServer.listen(HTTP_PORT);

wsServer.on('listening', () => {
  console.log(`${getServerMessageDatedTitle()} WS server started on ws://${wsServer.options.host}:${wsServer.options.port}`);
});

wsServer.on('error', (error) => {
  console.error(`${getServerMessageDatedTitle()} WS server error: ${error}`);
});
