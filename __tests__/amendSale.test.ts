import request from 'supertest';
import { app, server } from '../src/index'; // Adjust import based on your app structure
import { logger } from '../src/utils/logger';
import { saleStore } from '../src/models';

describe('Amend Sale Events', () => {
  beforeAll(() => {
    // Mock the logger to prevent actual logging during test
    jest.spyOn(logger, 'error').mockImplementation();
  });

  it('should allow to amend items within invoices processed in sales events via the amend sale endpoint, status code 202, No body', async () => {
    const amendment = {
      date: '2024-01-05',
      invoiceId: 'INV001',
      itemId: 'item1',
      cost: 150,
      taxRate: 0.2,
    };

    const response = await request(app).patch('/sale').send(amendment);
    expect(response.status).toBe(202);
    expect(response.body).toEqual({});
  });

  it('should allow to amend a sales event that has not been received, status code 202, No body', async () => {
    const amendment = {
      date: '2024-01-05',
      invoiceId: 'INV004',
      itemId: 'item4',
      cost: 200,
      taxRate: 0.15,
    };

    const response = await request(app).patch('/sale').send(amendment);
    expect(response.status).toBe(202);
    expect(response.body).toEqual({});
  });

  it('should amend sales events at multiple points in time', async () => {
    const amendments = [
      {
        date: '2024-01-06',
        invoiceId: 'INV001',
        itemId: 'item1',
        cost: 160,
        taxRate: 0.2,
      },
      {
        date: '2024-01-07',
        invoiceId: 'INV001',
        itemId: 'item1',
        cost: 170,
        taxRate: 0.2,
      },
    ];

    for (const amendment of amendments) {
      const response = await request(app).patch('/sale').send(amendment);
      expect(response.status).toBe(202);
      expect(response.body).toEqual({});
    }
  });

  it('should return 400 for invalid amendment structure', async () => {
    const amendment = {
      invoiceId: 'INV001',
      itemId: 'item1',
      cost: 'invalid-cost', // invalid cost
      taxRate: 0.2,
    };

    const response = await request(app).patch('/sale').send(amendment);
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid amendment structure');
  });

  it('should return 400 for invalid date format', async () => {
    const amendment = {
      date: 'invalid-date',
      invoiceId: 'INV001',
      itemId: 'item1',
      cost: 150,
      taxRate: 0.2,
    };

    const response = await request(app).patch('/sale').send(amendment);
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid date format');
  });

  it('should return 500 if an internal server error occurs during sale amendment', async () => {
    jest.spyOn(saleStore, 'amendSale').mockImplementation(() => {
      throw new Error('Mock error');
    });

    const amendment = {
      date: '2024-01-05',
      invoiceId: 'INV001',
      itemId: 'item1',
      cost: 150,
      taxRate: 0.2,
    };

    const response = await request(app).patch('/sale').send(amendment);
    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Internal Server Error');

    // Check if the logger.error was called with the expected error message
    expect(logger.error).toHaveBeenCalledWith(
      'Error amending sale: Error: Mock error'
    );
  });

  afterAll((done) => {
    server.close(done);
  });
});
