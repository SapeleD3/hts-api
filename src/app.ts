//load dependencies
import express, { NextFunction, Request, Response } from 'express';
import { config } from 'dotenv';
import logger from './helpers/logging';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { APP_USE_LIMIT } from './index.constants';
import userRoutes from './routes/user.routes';
import paymentRoutes from './routes/payments.routes';

config();

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(APP_USE_LIMIT);
app.use(userRoutes);
app.use(paymentRoutes);
app.use('/', (req: Request, res: Response) => {
  res.send('Welcome to HTS api');
});
app.use(morgan('combined', { stream: logger.stream.write }));
app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
  logger.error(
    `${req.method} - ${err.message}  - ${req.originalUrl} - ${req.ip}`
  );
  next(err);
});

export default app;
