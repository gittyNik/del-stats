import { rfc3339, createConnection } from './calendar-util.js';

describe('Test Calendar utils', () => {
  test('should date in return rfc3339 format', () => {
    expect(rfc3339(new Date().toISOString())).toBeTruthy();
  });

  test('Get Auth URL', () => {
    expect(createConnection()).toBeTruthy();
  });
  
});
