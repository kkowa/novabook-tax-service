import request from 'supertest';
import { app, server } from '../src/index'; // Adjust based on your app structure
import { eventStore } from '../src/models/index'; // Import eventStore to mock its method
import { logger } from '../src/utils/logger'; // Import the logger
import { SaleEvent } from '../src/models/EventStore'; // Import event types

describe('Transactions Route', () => {
  beforeAll(() => {
    jest.spyOn(logger, 'error').mockImplementation(); // Mock the logger
    jest.spyOn(logger, 'info').mockImplementation(); // Mock the info logger
  });

  afterAll((done) => {
    jest.restoreAllMocks(); // Restore the original logger methods
    server.close(done); // Close the server after tests
  });

  it('should return 202 and ingest a valid SALES event', async () => {
    const validEvent: SaleEvent = {
      eventType: 'SALES',
      date: '2024-01-01',
      invoiceId: 'INV001',
      items: [{ itemId: 'item1', cost: 100, taxRate: 0.2 }],
    };

    const response = await request(app).post('/transactions').send(validEvent);

    expect(response.status).toBe(202);
    expect(logger.info).toHaveBeenCalledWith(
      `Ingested event: ${JSON.stringify(validEvent)}`
    );
  });

  it('should return 400 if SALES event is missing invoiceId', async () => {
    const invalidEvent = {
      eventType: 'SALES',
      date: '2024-01-01',
      items: [{ itemId: 'item1', cost: 100, taxRate: 0.2 }],
    };

    const response = await request(app)
      .post('/transactions')
      .send(invalidEvent);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Invalid SALES event structure' });
  });

  it('should return 400 if SALES event has invalid items array', async () => {
    const invalidEvent = {
      eventType: 'SALES',
      date: '2024-01-01',
      invoiceId: 'INV001',
      items: {}, // Invalid items (not an array)
    };

    const response = await request(app)
      .post('/transactions')
      .send(invalidEvent);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Invalid SALES event structure' });
  });

  it('should return 400 if TAX_PAYMENT event is missing amount', async () => {
    const invalidEvent = {
      eventType: 'TAX_PAYMENT',
      date: '2024-01-01',
      // amount is missing
    };

    const response = await request(app)
      .post('/transactions')
      .send(invalidEvent);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid TAX_PAYMENT event structure',
    });
  });

  it('should return 400 for an unknown event type', async () => {
    const invalidEvent = {
      eventType: 'UNKNOWN_EVENT',
      date: '2024-01-01',
    };

    const response = await request(app)
      .post('/transactions')
      .send(invalidEvent);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Unknown eventType' });
  });

  it('should return 400 if date is in an invalid format', async () => {
    const invalidEvent = {
      eventType: 'SALES',
      date: 'invalid-date-format', // Invalid date format
      items: [{ itemId: 'item1', cost: 100, taxRate: 0.2 }],
    };

    const response = await request(app)
      .post('/transactions')
      .send(invalidEvent);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Invalid date format' }); // Check for correct JSON error message
  });

  it('should return 400 if eventType is missing', async () => {
    const invalidEvent = {
      date: '2024-01-01',
      items: [{ itemId: 'item1', cost: 100, taxRate: 0.2 }],
    };

    const response = await request(app)
      .post('/transactions')
      .send(invalidEvent);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Invalid event structure' });
  });

  it('should return 400 if date is missing', async () => {
    const invalidEvent = {
      eventType: 'SALES',
      items: [{ itemId: 'item1', cost: 100, taxRate: 0.2 }],
    };

    const response = await request(app)
      .post('/transactions')
      .send(invalidEvent);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Invalid event structure' });
  });

  it('should return 400 if both eventType and date are missing', async () => {
    const invalidEvent = {
      items: [{ itemId: 'item1', cost: 100, taxRate: 0.2 }],
    };

    const response = await request(app)
      .post('/transactions')
      .send(invalidEvent);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Invalid event structure' });
  });

  it('should return 500 if an internal error occurs during event ingestion', async () => {
    // Mock the addEvent method to throw an error
    jest.spyOn(eventStore, 'addEvent').mockImplementation(() => {
      throw new Error('Mock error'); // Simulate an internal error
    });

    const validEvent = {
      eventType: 'SALES',
      date: '2024-01-01',
      invoiceId: 'INV001',
      items: [{ itemId: 'item1', cost: 100, taxRate: 0.2 }],
    };

    const response = await request(app).post('/transactions').send(validEvent);

    // Check for 500 status and correct error message
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Internal Server Error' });

    // Ensure logger was called with the correct error message
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Error ingesting event:')
    ); // Expect logger.error to be called with a string containing the error message
  });
});
