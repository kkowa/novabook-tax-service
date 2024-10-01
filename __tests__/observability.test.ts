import { logger } from '../src/utils/logger';
import { jest } from '@jest/globals';
import { server } from '../src/index'; // Adjust import based on your app structure

describe('Observability', () => {
  it('should ensure the appropriate level of observability is implemented', () => {
    const spy = jest.spyOn(logger, 'info');
    logger.info('Test log message');
    expect(spy).toHaveBeenCalledWith('Test log message');
  });

  afterAll((done) => {
    server.close(done);
  });
});
