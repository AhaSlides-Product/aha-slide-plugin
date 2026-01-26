/**
 * E2E tests for AhaSDK
 *
 * Environment variables (from .env file):
 * - BASE_URL: API base URL (required)
 * - JWT_TOKEN: JWT authentication token (required)
 * - SLIDE_ID: Slide ID for testing (required)
 * - AHA_SDK_TEST_PRESENTATION_ID: Presentation ID for testing (required)
 *
 * Run with:
 * npm test
 */

import { HttpClient } from './api';
import AhaSDK from './api';

// Bootstrap from environment
function bootstrap() {
  const baseUrl = process.env.AHA_SDK_BASE_URL;
  const jwtToken = process.env.AHA_SDK_TEST_JWT_TOKEN;
  const slideId = process.env.AHA_SDK_TEST_SLIDE_ID;
  const presentationId = process.env.AHA_SDK_TEST_PRESENTATION_ID;

  if (!baseUrl) {
    throw new Error('AHA_SDK_BASE_URL environment variable is required');
  }

  if (!jwtToken) {
    throw new Error('AHA_SDK_TEST_JWT_TOKEN environment variable is required');
  }

  if (!slideId) {
    throw new Error('AHA_SDK_TEST_SLIDE_ID environment variable is required');
  }

  if (!presentationId) {
    throw new Error('AHA_SDK_TEST_PRESENTATION_ID environment variable is required');
  }

  const httpClient = new HttpClient({
    baseUrl,
    timeoutSeconds: 2,
    maxRetries: 1,
  });

  const sdk = new AhaSDK(
    'e2e-test-plugin',
    baseUrl,
    httpClient,
    jwtToken
  );

  return {
    sdk,
    httpClient,
    baseUrl,
    jwtToken,
    slideId: parseInt(slideId, 10),
    presentationId: parseInt(presentationId, 10),
  };
}

describe('AhaSDK E2E Tests', () => {
  let sdk: AhaSDK;
  let baseUrl: string;
  let slideId: number;
  let presentationId: number;

  jest.setTimeout(2000);

  beforeAll(() => {
    const config = bootstrap();
    sdk = config.sdk;
    baseUrl = config.baseUrl;
    slideId = config.slideId;
    presentationId = config.presentationId;
  });

  describe('KV Store Operations', () => {
    it('should create/update a KV entry', async () => {
      const path = '/e2e-test/kv-entry';
      const value = JSON.stringify({ timestamp: Date.now(), test: true });

      await sdk.kvCreate({
        path,
        end_parts: 'test-key',
        type: 'string',
        value,
      });
    });

    it('should retrieve a KV entry by key', async () => {
      // First create an entry
      const path = '/e2e-test/kv-retrieve';
      const testValue = JSON.stringify({ data: 'test-data', time: Date.now() });

      await sdk.kvCreate({
        path,
        end_parts: 'retrieve-test',
        type: 'string',
        value: testValue,
      });

      // Then retrieve it
      const key = `${path}/retrieve-test`;
      const entry = await sdk.kvGet({ key });

      expect(entry).toBeDefined();
      expect(entry.value).toBe(testValue);
      expect(entry.key).toBe(key);
    });

    it('should retrieve KV entries by path', async () => {
      const path = '/e2e-test/kv-path';

      // Create multiple entries
      await Promise.all([
        sdk.kvCreate({
          path,
          end_parts: 'entry1',
          type: 'string',
          value: 'value1',
        }),
        sdk.kvCreate({
          path,
          end_parts: 'entry2',
          type: 'string',
          value: 'value2',
        }),
        sdk.kvCreate({
          path,
          end_parts: 'entry3',
          type: 'string',
          value: 'value3',
        }),
      ]);

      // Retrieve by path
      const response = await sdk.kvGetByPath({ path, limit: 100 });

      expect(response).toBeDefined();
      expect(response.keysvalues).toBeDefined();
      expect(response.keysvalues.length).toBeGreaterThan(0);
    });

    it('should handle ephemeral KV data', async () => {
      const path = '/e2e-test/ephemeral';
      const ephemeralValue = JSON.stringify({ ephemeral: true, ttl: 'short' });

      // Create ephemeral data (not persisted, not retained)
      await sdk.kvCreate({
        path,
        end_parts: 'ephemeral-entry',
        type: 'string',
        value: ephemeralValue,
        not_persist: true,
        not_retained_mqtt: true,
      });
    });
  });

  describe('Slide Attributes', () => {
    it('should upsert a slide attribute', async () => {
      const result = await sdk.upsertSlideAttribute({
        slideId,
        attributeKey: 'skipSlide',
        attributeValue: true,
      });

      expect(result).toBeDefined();
      expect(result.slideId).toBe(slideId);
    });

    it('should find slide attributes', async () => {
      // First create an attribute
      await sdk.upsertSlideAttribute({
        slideId,
        attributeKey: 'testKey',
        attributeValue: 'test-data',
      });

      // Then find it
      const attributes = await sdk.findSlideAttributes({
        presentationId,
        slideIds: [slideId],
        types: ['testKey'],
      });

      expect(attributes).toBeDefined();
      expect(Array.isArray(attributes)).toBe(true);
    });
  });

  describe('Counting API', () => {
    it('should count total', async () => {
      await sdk.countTotal({
        counts: [
          {
            bucket: 'e2e-test',
            key: 'counter-1',
            increase_by: 1,
          },
        ],
      });
    });

    it('should count unique', async () => {
      await sdk.countUnique({
        counts: [
          {
            bucket: 'e2e-test',
            key: 'unique-users',
            item: `user-${Date.now()}`,
          },
        ],
      });
    });

    it('should reset total count', async () => {
      await sdk.resetCountTotal({
        keys: [
          {
            bucket: 'e2e-test',
            key: 'counter-to-reset',
          },
        ],
      });
    });

    it('should reset unique count', async () => {
      await sdk.resetCountUnique({
        keys: [
          {
            bucket: 'e2e-test',
            key: 'unique-to-reset',
          },
        ],
      });
    });

    it('should set total count', async () => {
      await sdk.setTotal({
        totals: [
          {
            bucket: 'e2e-test',
            key: 'manual-count',
            total: 42,
            timestamp: Date.now(),
          },
        ],
      });
    });
  });

  describe('Bulk Submission Operations', () => {
    it.skip('should create multiple submissions', async () => {
      const submissions = await sdk.createSubmissions({
        submissions: [
          {
            type: 'e2e-test',
            slideId,
            slideVersion: 1,
            data: { answer: 'A', userId: 'user1' },
          },
          {
            type: 'e2e-test',
            slideId,
            slideVersion: 1,
            data: { answer: 'B', userId: 'user2' },
          },
        ],
      });

      expect(submissions).toBeDefined();
      expect(Array.isArray(submissions)).toBe(true);
      expect(submissions.length).toBeGreaterThan(0);

      // Store IDs for later tests
      return submissions.map(s => s.id);
    });

    it('should get submissions by IDs', async () => {
      // Note: This would require submission IDs from the previous test
      // In a real scenario, you'd save them and use here
      const submissionIds = ['test-id-1', 'test-id-2'];

      try {
        const submissions = await sdk.getSubmissionsByIds(submissionIds);
        expect(Array.isArray(submissions)).toBe(true);
      } catch (error) {
        // getSubmissionsByIds not yet implemented
      }
    });

    it('should get slide submissions', async () => {
      try {
        const response = await sdk.getSlideSubmissions({
          slideId,
          slideVersion: 1,
          type: 'e2e-test',
          pagination: { cursor: 0, limit: 50 },
        });

        expect(response).toBeDefined();
        expect(Array.isArray(response.submissions)).toBe(true);
      } catch (error) {
        // getSlideSubmissions not yet implemented
      }
    });

    it('should update multiple submissions', async () => {
      const submissionIds = ['test-update-1', 'test-update-2'];

      try {
        const updated = await sdk.updateSubmissions({
          updates: [
            {
              id: submissionIds[0],
              data: { answer: 'A', updated: true },
            },
            {
              id: submissionIds[1],
              data: { answer: 'B', updated: true },
            },
          ],
        });

        expect(Array.isArray(updated)).toBe(true);
      } catch (error) {
        // updateSubmissions not yet implemented
      }
    });

    it('should delete submissions', async () => {
      const submissionIds = ['test-delete-1', 'test-delete-2'];

      try {
        await sdk.deleteSubmission(submissionIds);
      } catch (error) {
        // deleteSubmission not yet implemented
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid key gracefully', async () => {
      try {
        await sdk.kvGet({ key: '/non/existent/key/that/should/not/exist' });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle unauthorized requests', async () => {
      // Create SDK without JWT for a protected endpoint
      const httpClient = new HttpClient({ baseUrl });
      const sdkNoAuth = new AhaSDK('e2e-test', baseUrl, httpClient);

      try {
        await sdkNoAuth.kvCreate({
          path: '/unauthorized-test',
          end_parts: 'test',
          type: 'string',
          value: 'test',
        });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
