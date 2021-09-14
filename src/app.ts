import express from 'express';
import config from 'config';
import logger from './utils/logger';
import connectDb from './database/connectDb';
import routes from './modules/routes';

const port = config.get('port') as number;
const host = config.get('host') as string;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.listen(port, host, () => {
  logger.info(`🔥 :> ${host}:${port}`);

  connectDb();
  routes(app);
});
