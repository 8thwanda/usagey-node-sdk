import nock from 'nock';
import { UsageyClient } from '../client';
import { AuthenticationError, RateLimitError, ValidationError as _ValidationError } from '../errors';

describe('UsageyClient', () => {
  const API_KEY = 'test_api_key';
  const BASE_URL = 'https://api.usagey.com';
  let client: UsageyClient;

  beforeEach(() => {
    client = new UsageyClient(API_KEY, { baseUrl: BASE_URL });
    nock.cleanAll();
  });

  afterAll(() => {
    nock.restore();
  });

  describe('trackEvent', () => {
    it('should successfully track an event', async () => {
      const mockResponse = {
        success: true,
        event_id: 'evt_123',
        timestamp: '2023-01-01T00:00:00Z'
      };

      nock(BASE_URL)
        .post('/api/usage', {
          event_type: 'api_call',
          quantity: 1
        })
        .reply(200, mockResponse);

      const result = await client.trackEvent('api_call');
      expect(result).toEqual(mockResponse);
    });

    it('should include quantity and metadata when provided', async () => {
      const mockResponse = {
        success: true,
        event_id: 'evt_123',
        timestamp: '2023-01-01T00:00:00Z'
      };

      const metadata = { endpoint: '/users', method: 'GET' };

      nock(BASE_URL)
        .post('/api/usage', {
          event_type: 'api_call',
          quantity: 5,
          metadata
        })
        .reply(200, mockResponse);

      const result = await client.trackEvent('api_call', 5, metadata);
      expect(result).toEqual(mockResponse);
    });

    it('should throw AuthenticationError on 401', async () => {
      nock(BASE_URL)
        .post('/api/usage')
        .reply(401, { error: 'Invalid API key' });

      await expect(client.trackEvent('api_call')).rejects.toThrow(AuthenticationError);
    });

    it('should throw RateLimitError on 429', async () => {
      nock(BASE_URL)
        .post('/api/usage')
        .reply(429, { 
          error: 'Rate limit exceeded',
          retry_after: 60,
          limit: 100,
          remaining: 0
        });

      await expect(client.trackEvent('api_call')).rejects.toThrow(RateLimitError);
    });
  });

  describe('createApiKey', () => {
    it('should successfully create an API key', async () => {
      const mockResponse = {
        id: 'key_123',
        name: 'Test Key',
        key: 'usgy_test123',
        createdAt: '2023-01-01T00:00:00Z'
      };

      nock(BASE_URL)
        .post('/api/api-keys', {
          name: 'Test Key',
          organizationId: 'org_123'
        })
        .reply(200, mockResponse);

      const result = await client.createApiKey('Test Key', 'org_123');
      expect(result).toEqual(mockResponse);
    });

    it('should include expiresAt when provided', async () => {
      const mockResponse = {
        id: 'key_123',
        name: 'Test Key',
        key: 'usgy_test123',
        createdAt: '2023-01-01T00:00:00Z',
        expiresAt: '2023-12-31T23:59:59Z'
      };

      const expiresAt = new Date('2023-12-31T23:59:59Z');

      nock(BASE_URL)
        .post('/api/api-keys', {
          name: 'Test Key',
          organizationId: 'org_123',
          expiresAt: expiresAt.toISOString()
        })
        .reply(200, mockResponse);

      const result = await client.createApiKey('Test Key', 'org_123', expiresAt);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('regenerateApiKey', () => {
    it('should successfully regenerate an API key', async () => {
      const mockResponse = {
        id: 'key_123',
        key: 'usgy_newkey123'
      };

      nock(BASE_URL)
        .post('/api/api-keys/key_123/regenerate')
        .reply(200, mockResponse);

      const result = await client.regenerateApiKey('key_123');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteApiKey', () => {
    it('should successfully delete an API key', async () => {
      const mockResponse = { success: true };

      nock(BASE_URL)
        .delete('/api/api-keys/key_123')
        .reply(200, mockResponse);

      const result = await client.deleteApiKey('key_123');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getUsageStats', () => {
    it('should successfully retrieve usage stats', async () => {
      const mockResponse = {
        usage: {
          currentUsage: 500,
          limit: 1000,
          percentage: 50,
          plan: 'Professional'
        }
      };

      nock(BASE_URL)
        .get('/api/usage/stats')
        .reply(200, mockResponse);

      const result = await client.getUsageStats();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getUsageEvents', () => {
    it('should successfully retrieve usage events with no parameters', async () => {
      const mockResponse = {
        success: true,
        data: [
          { id: 'evt_1', event_type: 'api_call', quantity: 1, timestamp: '2023-01-01T00:00:00Z' }
        ]
      };

      nock(BASE_URL)
        .get('/api/usage')
        .reply(200, mockResponse);

      const result = await client.getUsageEvents();
      expect(result).toEqual(mockResponse);
    });

    it('should include query parameters when provided', async () => {
      const mockResponse = {
        success: true,
        data: [
          { id: 'evt_1', event_type: 'api_call', quantity: 1, timestamp: '2023-01-01T00:00:00Z' }
        ]
      };

      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-01-31');

      nock(BASE_URL)
        .get('/api/usage')
        .query({
          event_type: 'api_call',
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          limit: 10
        })
        .reply(200, mockResponse);

      const result = await client.getUsageEvents({
        eventType: 'api_call',
        startDate,
        endDate,
        limit: 10
      });
      
      expect(result).toEqual(mockResponse);
    });
  });
});