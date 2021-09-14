// import logger from '@/utils/logger';
import { Express, Request, Response } from 'express';

// com
export default function (app: Express) {
  app.get('/health-check', (_req: Request, res: Response) => {
    // logger.info('Healthy');
    res.json({ data: 'Success' });
  });
}
