import request from 'supertest';
import { app, server } from '../src/index'; // Adjust based on your app structure

describe('Health Check Endpoint', () => {
  afterAll((done) => {
    server.close(done);
  });

  it('should return 200 and OK on /health endpoint', async () => {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.text).toBe('OK');
  });
});
