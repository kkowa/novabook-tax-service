import express from 'express';
import transactionRouter from './routes/transactions';
import taxPositionRouter from './routes/taxPosition';
import amendSaleRouter from './routes/amendSale';
import { logger } from './utils/logger';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const app = express();
const PORT = process.env.PORT || 3000;

// Swagger definition
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0', // Specify the OpenAPI version
    info: {
      title: 'My API', // Title of your API
      version: '1.0.0', // Version of your API
      description: 'API Documentation', // Description of your API
    },
    servers: [
      {
        url: `http://localhost:${PORT}`, // Your API server URL
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API docs (where your route files are)
};

// Generate Swagger docs
const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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
