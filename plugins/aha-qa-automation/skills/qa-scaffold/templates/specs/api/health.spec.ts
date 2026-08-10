import { test, expect } from '@fixtures/test';

test.describe('Health', () => {
  test('{{PREFIX}}-TC02: health endpoint returns 200 with a JSON body', async ({ api }) => {
    const res = await api.get('/health');

    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('application/json');
  });
});
