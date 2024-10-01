import express from 'express';
import transactionRouter from './routes/transactions';
import taxPositionRouter from './routes/taxPosition';
import amendSaleRouter from './routes/amendSale';
import { logger } from './utils/logger';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Routes
app.use('/transactions', transactionRouter);
app.use('/tax-position', taxPositionRouter);
app.use('/sale', amendSaleRouter);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Error Handling Middleware
app.use(
  (
    err: unknown,
    req: express.Request,
    res: express.Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: express.NextFunction
  ) => {
    logger.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
);

const server = app.listen(PORT, () => {
  logger.info(`Server is running on port http://localhost:${PORT}`);
});

export { app, server };
