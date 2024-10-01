import request from 'supertest';
import { app, server } from '../src/index'; // Adjust based on your app structure
// import { logger } from '../src/utils/logger'; // Import the logger
// import { createLogger, format, Logger, transports } from 'winston';

describe('Health Check Endpoint', () => {
  afterAll((done) => {
    server.close(done);
  });

  it('should return 200 and OK on /health endpoint', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.text).toBe('OK');
  });
});

//TODO: This test is failing. Fix it.
// describe('Error Handling Middleware in index.ts', () => {
//   let mockLogger: Logger;

//   beforeAll(() => {
//     // Create a mock logger that returns a Logger instance
//     mockLogger = createLogger({
//       format: format.simple(),
//       transports: [new transports.Console()],
//     });

//     jest.spyOn(mockLogger, 'error').mockReturnValue(mockLogger); // Mocking the return type
//     jest.spyOn(logger, 'error').mockImplementation(
//       (
//         e // Call the mock logger's error method
//       ) => mockLogger.error(e)
//     );
//   });

//   afterAll((done) => {
//     jest.restoreAllMocks(); // Restore the original logger methods
//     server.close(done); // Close the server after tests
//   });

//   // Create a route to trigger an error
//   app.get('/error-trigger', (req, res, next) => {
//     const error = new Error('Test error');
//     next(error); // This will invoke the error-handling middleware
//   });

//   test('should log the error and return 500 with "Internal Server Error"', async () => {
//     const response = await request(app).get('/error-trigger');

//     // Verify the response
//     expect(response.status).toBe(500); // Check for 500 status
//     expect(response.body).toEqual({ error: 'Internal Server Error' }); // Check for correct JSON error message

//     // Verify the logger was called with the error
//     expect(logger.error).toHaveBeenCalledWith(expect.any(Error)); // Ensure logger.error was called with the error object
//   });
// });
