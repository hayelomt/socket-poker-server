import mongoose from 'mongoose';
import config from 'config';
import logger from '@/utils/logger';

export default () => {
  const dbUri = config.get('dbUri') as string;

  return mongoose
    .connect(dbUri, {})
    .then(() => {
      logger.info('Database connected');
    })
    .catch((error) => {
      logger.error('db error', error);
      process.exit(1);
    });
};
