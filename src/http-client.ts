import axios, { AxiosInstance, AxiosError } from 'axios';
import { 
  UsageyError, 
  AuthenticationError, 
  RateLimitError, 
  ValidationError 
} from './errors';

/**
 * Creates and configures an HTTP client for making requests to the Usagey API
 * 
 * @param apiKey The API key to use for authentication
 * @param baseUrl The base URL for the Usagey API
 * @returns Configured Axios instance
 */
export function createHttpClient(apiKey: string, baseUrl: string): AxiosInstance {
  const client = axios.create({
    baseURL: baseUrl,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'User-Agent': `UsageyNodeSDK/0.1.0 Node/${process.version}`
    }
  });

  // Add response interceptor for error handling
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (!error.response) {
        throw new UsageyError('Network error', 'network_error');
      }

      const { status, data } = error.response;
      const errorMessage =
        typeof data === 'object' && data !== null
          ? ((data as any).message as string) ||
            ((data as any).error as string) ||
            'Unknown error'
          : 'Unknown error';

      // Map HTTP status codes to specific error types
      switch (status) {
        case 401:
          throw new AuthenticationError(errorMessage);
        case 402:
          throw new UsageyError('Payment required', 'payment_required', data);
        case 403:
          throw new UsageyError('Forbidden', 'forbidden', data);
        case 404:
          throw new UsageyError('Resource not found', 'not_found', data);
        case 422:
          throw new ValidationError(errorMessage, data);
        case 429:
          throw new RateLimitError(errorMessage, data);
        default:
          throw new UsageyError(
            errorMessage,
            `http_error_${status}`,
            data
          );
      }
    }
  );

  return client;
}