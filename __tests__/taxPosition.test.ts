import request from 'supertest';
import { app, server } from '../src/index'; // Adjust import based on your app structure
import { SaleEvent, TaxPaymentEvent } from '../src/models/EventStore';
import { eventStore } from '../src/models';
import { logger } from '../src/utils/logger';

describe('Tax Position Querying', () => {
  it('should allow users to query their tax position for any given point in time using the /tax-position endpoint, status code 200', async () => {
    const response = await request(app)
      .get('/tax-position')
      .query({ date: '2024-01-03' });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('taxPosition');
  });

  it('should return 400 for missing date parameter', async () => {
    const response = await request(app).get('/tax-position');
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Missing or invalid date parameter');
  });

  it('should return 400 for invalid date format', async () => {
    const response = await request(app)
      .get('/tax-position')
      .query({ date: 'invalid-date' });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid date format');
  });

  it('should return tax position when no events exist', async () => {
    const response = await request(app)
      .get('/tax-position')
      .query({ date: '2024-01-01' });
    expect(response.status).toBe(200);
    expect(response.body.taxPosition).toBe(0);
  });

  it('should calculate total tax from sales events', async () => {
    const saleEvent: SaleEvent = {
      eventType: 'SALES',
      date: '2024-01-01',
      invoiceId: 'INV001',
      items: [
        { itemId: 'item1', cost: 100, taxRate: 0.2 },
        { itemId: 'item2', cost: 200, taxRate: 0.1 },
      ],
    };

    eventStore.addEvent(saleEvent);

    const response = await request(app)
      .get('/tax-position')
      .query({ date: '2024-01-02' });

    // Total tax from sales: (100 * 0.2) + (200 * 0.1) = 20 + 20 = 40
    expect(response.status).toBe(200);
    expect(response.body.taxPosition).toBe(40);
  });

  it('should calculate total tax payments from tax payment events', async () => {
    const taxPaymentEvent: TaxPaymentEvent = {
      eventType: 'TAX_PAYMENT',
      date: '2024-01-02',
      amount: 50,
    };

    eventStore.addEvent(taxPaymentEvent);

    const response = await request(app)
      .get('/tax-position')
      .query({ date: '2024-01-03' });

    // Total tax payments: 50
    expect(response.status).toBe(200);
    expect(response.body.taxPosition).toBe(-10); // No sales, so tax position is negative
  });

  it('should calculate correct tax position with both sales and tax payment events', async () => {
    eventStore['events'] = [];
    const saleEvent: SaleEvent = {
      eventType: 'SALES',
      date: '2024-01-01',
      invoiceId: 'INV001',
      items: [
        { itemId: 'item1', cost: 100, taxRate: 0.2 }, // Tax = 100 * 0.2 = 20
        { itemId: 'item2', cost: 200, taxRate: 0.1 }, // Tax = 200 * 0.1 = 20
      ],
    };

    const taxPaymentEvent: TaxPaymentEvent = {
      eventType: 'TAX_PAYMENT',
      date: '2024-01-02',
      amount: 30, // Tax payment = 30
    };

    // Add the events to the store
    eventStore.addEvent(saleEvent);
    eventStore.addEvent(taxPaymentEvent);

    // Query the tax position
    const response = await request(app)
      .get('/tax-position')
      .query({ date: '2024-01-03' });

    // Total tax from sales: 20 + 20 = 40
    // Total tax payments: 30
    // Tax position = 40 - 30 = 10
    expect(response.status).toBe(200);
    expect(response.body.taxPosition).toBe(10); // Correct tax position
  });

  it('should return 500 and log the error if an exception occurs', async () => {
    jest.spyOn(logger, 'error').mockImplementation();
    jest.spyOn(eventStore, 'getEventsUpTo').mockImplementation(() => {
      throw new Error('Mock error');
    });

    const response = await request(app)
      .get('/tax-position')
      .query({ date: '2024-01-03' });

    // Check if the response is 500
    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Internal Server Error');

    // Check if the logger.error was called with the expected error message
    expect(logger.error).toHaveBeenCalledWith(
      'Error querying tax position: Error: Mock error'
    );
  });

  afterAll((done) => {
    server.close(done);
  });
});
