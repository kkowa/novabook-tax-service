import express, { Express } from 'express';
import request from 'supertest';
import { jest } from '@jest/globals';

// Import the router to test
import transactionsRouter from '../src/routes/transactions';

// Mock dependencies
jest.mock('../src/models/index');
jest.mock('../src/utils/logger');

describe('test /transactions endpoint', () => {
  let app: Express;

  beforeAll(() => {
    // Initialize Express app and mount the router
    app = express();
    app.use(express.json());
    app.use('/transactions', transactionsRouter);
  });

  beforeEach(() => {
    // Clear all mock calls before each test
    jest.clearAllMocks();
  });

  it('should successfully POST sales events and respond with 202', async () => {
    const data = {
      eventType: 'SALES',
      date: '2024-02-22T17:29:39Z',
      invoiceId: '3419027d-960f-4e8f-b8b7-f7b2b4791824',
      items: [
        {
          itemId: '02db47b6-fe68-4005-a827-24c6e962f3df',
          cost: 1099,
          taxRate: 0.2,
        },
      ],
    };

    const response = await request(app)
      .post('/transactions')
      .send(data)
      .set('Accept', 'application/json');

    expect(response.status).toBe(202);
  });

  it('should successfully POST tax payment event and respond with 202', async () => {
    const data = {
      eventType: 'TAX_PAYMENT',
      date: '2024-02-22T17:29:39Z',
      amount: 74901,
    };

    const response = await request(app)
      .post('/transactions')
      .send(data)
      .set('Accept', 'application/json');

    expect(response.status).toBe(202);
  });
});

// describe('test /tax-position endpoint', () => {
//   let app: Express;

//   beforeAll(() => {
//     // Initialize Express app and mount the router
//     app = express();
//     app.use(express.json());
//     app.use('/transactions', transactionsRouter);
//   });

//   beforeEach(() => {
//     // Clear all mock calls before each test
//     jest.clearAllMocks();
//   });

//   it('should successfully ingests sales events and respond with 202', async () => {
//     const data = {
//       eventType: 'TAX_PAYMENT',
//       date: '2024-02-22T17:29:39Z',
//       amount: 74901,
//     };
//     const response = await request(app)
//       .post('/transactions')
//       .send(data)
//       .set('Accept', 'application/json');

//     expect(response.status).toBe(202);
//   });
// });
