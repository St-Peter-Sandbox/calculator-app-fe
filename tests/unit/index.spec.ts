import { SERVICE_NAME } from '../../src/index';

describe('calculator-app-frontend', () => {
  it('should export SERVICE_NAME', () => {
    expect(SERVICE_NAME).toBe('calculator-app-frontend');
  });
});