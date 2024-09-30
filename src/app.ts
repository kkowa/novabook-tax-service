import express from 'express';
import transactionRoutes from './routes/transactions';

const app = express();

app.use(express.json());

app.use(transactionRoutes);

export default app;
