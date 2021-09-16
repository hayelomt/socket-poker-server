import config from 'config';
import http from 'http';
import { Server } from 'socket.io';
import connectDb from './database/connectDb';
import routes from './modules/routes';
import app from './app';
import logger from './utils/logger';
import sockets from './modules/sockets';

const port = config.get('port') as number;
const host = config.get('host') as string;
const httpServer = http.createServer(app);
const io = new Server(httpServer);

sockets(io);

httpServer.listen(port, host, () => {
  logger.info(`🔥 :> ${host}:${port}`);

  connectDb();
  routes(app);
});
