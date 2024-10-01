import request from 'supertest';
import { app, server } from '../src/index'; // Adjust import based on your app structure

describe('Invoice Date Validation', () => {
  it('should accept invoice date in the past', async () => {
    const saleEvent = {
      eventType: 'SALES',
      date: '2020-01-01',
      invoiceId: 'INV002',
      items: [{ itemId: 'item2', cost: 100, taxRate: 0.2 }],
    };

    const response = await request(app).post('/transactions').send(saleEvent);
    expect(response.status).toBe(202);
  });

  it('should accept invoice date in the future', async () => {
    const saleEvent = {
      eventType: 'SALES',
      date: '2025-01-01',
      invoiceId: 'INV003',
      items: [{ itemId: 'item3', cost: 200, taxRate: 0.2 }],
    };

    const response = await request(app).post('/transactions').send(saleEvent);
    expect(response.status).toBe(202);
  });

  afterAll((done) => {
    server.close(done);
  });
});
