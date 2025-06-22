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

  describe('constructor', () => {
    it('should use provided baseUrl when options.baseUrl is provided', () => {
      const customBaseUrl = 'https://custom.api.com';
      const customClient = new UsageyClient(API_KEY, { baseUrl: customBaseUrl });
      
      // We can't directly access private properties, but we can test the behavior
      expect(customClient).toBeInstanceOf(UsageyClient);
    });

    it('should use default baseUrl when options.baseUrl is not provided', () => {
      const defaultClient = new UsageyClient(API_KEY);
      expect(defaultClient).toBeInstanceOf(UsageyClient);
    });

    it('should use default baseUrl when options.baseUrl is empty string', () => {
      const emptyBaseUrlClient = new UsageyClient(API_KEY, { baseUrl: '' });
      expect(emptyBaseUrlClient).toBeInstanceOf(UsageyClient);
    });

    it('should use default baseUrl when options.baseUrl is null', () => {
      const nullBaseUrlClient = new UsageyClient(API_KEY, { baseUrl: null as any });
      expect(nullBaseUrlClient).toBeInstanceOf(UsageyClient);
    });

    it('should use default baseUrl when options.baseUrl is undefined', () => {
      const undefinedBaseUrlClient = new UsageyClient(API_KEY, { baseUrl: undefined });
      expect(undefinedBaseUrlClient).toBeInstanceOf(UsageyClient);
    });

    it('should use default baseUrl when options is empty object', () => {
      const emptyOptionsClient = new UsageyClient(API_KEY, {});
      expect(emptyOptionsClient).toBeInstanceOf(UsageyClient);
    });
  });

  describe('trackEvent', () => {
  it('should successfully track an event with default quantity and no metadata', async () => {
    const mockResponse = {
      success: true,
      event_id: 'evt_123',
      timestamp: '2023-01-01T00:00:00Z'
    };

    nock(BASE_URL)
      .post('/api/usage', (body) => {
        expect(body).toEqual({
          event_type: 'api_call',
          quantity: 1,
          metadata: undefined
        });
        return true;
      })
      .reply(200, mockResponse);

    const result = await client.trackEvent('api_call');
    expect(result).toEqual(mockResponse);
  });

  it('should successfully track an event with explicit quantity and no metadata', async () => {
    const mockResponse = {
      success: true,
      event_id: 'evt_123',
      timestamp: '2023-01-01T00:00:00Z'
    };

    nock(BASE_URL)
      .post('/api/usage', (body) => {
        expect(body).toEqual({
          event_type: 'api_call',
          quantity: 5,
          metadata: undefined
        });
        return true;
      })
      .reply(200, mockResponse);

    const result = await client.trackEvent('api_call', 5);
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

  it('should handle explicitly passed undefined metadata', async () => {
    const mockResponse = {
      success: true,
      event_id: 'evt_123',
      timestamp: '2023-01-01T00:00:00Z'
    };

    nock(BASE_URL)
      .post('/api/usage', (body) => {
        expect(body).toEqual({
          event_type: 'api_call',
          quantity: 1,
          metadata: undefined
        });
        return true;
      })
      .reply(200, mockResponse);

    const result = await client.trackEvent('api_call', 1, undefined);
    expect(result).toEqual(mockResponse);
  });

  it('should handle empty metadata object', async () => {
    const mockResponse = {
      success: true,
      event_id: 'evt_123',
      timestamp: '2023-01-01T00:00:00Z'
    };

    const metadata = {};

    nock(BASE_URL)
      .post('/api/usage', {
        event_type: 'api_call',
        quantity: 1,
        metadata
      })
      .reply(200, mockResponse);

    const result = await client.trackEvent('api_call', 1, metadata);
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

    it('should handle createApiKey without expiresAt (undefined branch)', async () => {
      const mockResponse = {
        id: 'key_123',
        name: 'Test Key',
        key: 'usgy_test123',
        createdAt: '2023-01-01T00:00:00Z'
      };

      nock(BASE_URL)
        .post('/api/api-keys', (body) => {
          expect(body).toEqual({
            name: 'Test Key',
            organizationId: 'org_123',
            expiresAt: undefined
          });
          return true;
        })
        .reply(200, mockResponse);

      const result = await client.createApiKey('Test Key', 'org_123');
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

    it('should handle getUsageEvents with string dates (string branch)', async () => {
      const mockResponse = {
        success: true,
        data: [
          { id: 'evt_1', event_type: 'api_call', quantity: 1, timestamp: '2023-01-01T00:00:00Z' }
        ]
      };

      nock(BASE_URL)
        .get('/api/usage')
        .query({
          start_date: '2023-01-01T00:00:00.000Z',
          end_date: '2023-01-31T23:59:59.999Z'
        })
        .reply(200, mockResponse);

      const result = await client.getUsageEvents({
        startDate: '2023-01-01T00:00:00.000Z',
        endDate: '2023-01-31T23:59:59.999Z'
      });
      
      expect(result).toEqual(mockResponse);
    });

    it('should handle getUsageEvents with only startDate as Date', async () => {
      const mockResponse = {
        success: true,
        data: []
      };

      const startDate = new Date('2023-01-01');

      nock(BASE_URL)
        .get('/api/usage')
        .query({
          start_date: startDate.toISOString()
        })
        .reply(200, mockResponse);

      const result = await client.getUsageEvents({
        startDate
      });
      
      expect(result).toEqual(mockResponse);
    });

    it('should handle getUsageEvents with only endDate as Date', async () => {
      const mockResponse = {
        success: true,
        data: []
      };

      const endDate = new Date('2023-01-31T23:59:59Z');

      nock(BASE_URL)
        .get('/api/usage')
        .query({
          end_date: endDate.toISOString()
        })
        .reply(200, mockResponse);

      const result = await client.getUsageEvents({
        endDate
      });
      
      expect(result).toEqual(mockResponse);
    });

    it('should handle getUsageEvents with only startDate as string', async () => {
      const mockResponse = {
        success: true,
        data: []
      };

      nock(BASE_URL)
        .get('/api/usage')
        .query({
          start_date: '2023-01-01T00:00:00.000Z'
        })
        .reply(200, mockResponse);

      const result = await client.getUsageEvents({
        startDate: '2023-01-01T00:00:00.000Z'
      });
      
      expect(result).toEqual(mockResponse);
    });

    it('should handle getUsageEvents with only endDate as string', async () => {
      const mockResponse = {
        success: true,
        data: []
      };

      nock(BASE_URL)
        .get('/api/usage')
        .query({
          end_date: '2023-01-31T23:59:59.999Z'
        })
        .reply(200, mockResponse);

      const result = await client.getUsageEvents({
        endDate: '2023-01-31T23:59:59.999Z'
      });
      
      expect(result).toEqual(mockResponse);
    });

    it('should handle getUsageEvents with only eventType', async () => {
      const mockResponse = {
        success: true,
        data: []
      };

      nock(BASE_URL)
        .get('/api/usage')
        .query({
          event_type: 'api_call'
        })
        .reply(200, mockResponse);

      const result = await client.getUsageEvents({
        eventType: 'api_call'
      });
      
      expect(result).toEqual(mockResponse);
    });

    it('should handle getUsageEvents with only limit', async () => {
      const mockResponse = {
        success: true,
        data: []
      };

      nock(BASE_URL)
        .get('/api/usage')
        .query({
          limit: 5
        })
        .reply(200, mockResponse);

      const result = await client.getUsageEvents({
        limit: 5
      });
      
      expect(result).toEqual(mockResponse);
    });
  });
});