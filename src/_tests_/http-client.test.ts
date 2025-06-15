import nock from 'nock';
import { createHttpClient } from '../http-client';
import { 
  UsageyError, 
  AuthenticationError, 
  RateLimitError, 
  ValidationError 
} from '../errors';

describe('HTTP Client', () => {
  const API_KEY = 'test_api_key';
  const BASE_URL = 'https://usagey.com';
  
  beforeEach(() => {
    nock.cleanAll();
  });

  afterAll(() => {
    nock.restore();
  });

  it('should set the correct headers', async () => {
    const scope = nock(BASE_URL)
      .get('/test')
      .matchHeader('Authorization', `Bearer ${API_KEY}`)
      .matchHeader('Content-Type', 'application/json')
      .matchHeader('User-Agent', /UsageyNodeSDK\/.*/)
      .reply(200, { success: true });

    const client = createHttpClient(API_KEY, BASE_URL);
    await client.get('/test');
    
    expect(scope.isDone()).toBe(true);
  });

  it('should handle successful responses', async () => {
    const mockResponse = { success: true, data: 'test' };
    
    nock(BASE_URL)
      .get('/test')
      .reply(200, mockResponse);

    const client = createHttpClient(API_KEY, BASE_URL);
    const response = await client.get('/test');
    
    expect(response.status).toBe(200);
    expect(response.data).toEqual(mockResponse);
  });

  it('should throw AuthenticationError on 401', async () => {
    nock(BASE_URL)
      .get('/test')
      .reply(401, { error: 'Invalid API key' });

    const client = createHttpClient(API_KEY, BASE_URL);
    
    await expect(client.get('/test')).rejects.toThrow(AuthenticationError);
    await expect(client.get('/test')).rejects.toMatchObject({
      message: 'Invalid API key',
      code: 'authentication_error'
    });
  });

  it('should throw RateLimitError on 429', async () => {
    nock(BASE_URL)
      .get('/test')
      .reply(429, { 
        error: 'Rate limit exceeded',
        retry_after: 60,
        limit: 100,
        remaining: 0
      });

    const client = createHttpClient(API_KEY, BASE_URL);
    
    await expect(client.get('/test')).rejects.toThrow(RateLimitError);
    await expect(client.get('/test')).rejects.toMatchObject({
      message: 'Rate limit exceeded',
      code: 'rate_limit_error',
      retryAfter: 60,
      limit: 100,
      remaining: 0
    });
  });

  it('should throw ValidationError on 422', async () => {
    nock(BASE_URL)
      .get('/test')
      .reply(422, { 
        error: 'Validation failed',
        details: {
          field1: ['Error 1', 'Error 2'],
          field2: ['Error 3']
        }
      });

    const client = createHttpClient(API_KEY, BASE_URL);
    
    await expect(client.get('/test')).rejects.toThrow(ValidationError);
    await expect(client.get('/test')).rejects.toHaveProperty('errors');
  });

  it('should throw UsageyError on other HTTP errors', async () => {
    nock(BASE_URL)
      .get('/test')
      .reply(500, { error: 'Internal server error' });

    const client = createHttpClient(API_KEY, BASE_URL);
    
    await expect(client.get('/test')).rejects.toThrow(UsageyError);
    await expect(client.get('/test')).rejects.toMatchObject({
      message: 'Internal server error',
      code: 'http_error_500'
    });
  });

  it('should throw UsageyError on network errors', async () => {
    nock(BASE_URL)
      .get('/test')
      .replyWithError('Network error');

    const client = createHttpClient(API_KEY, BASE_URL);
    
    await expect(client.get('/test')).rejects.toThrow(UsageyError);
    await expect(client.get('/test')).rejects.toMatchObject({
      message: 'Network error',
      code: 'network_error'
    });
  });
});