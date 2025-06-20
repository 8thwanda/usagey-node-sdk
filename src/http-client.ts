import axios, { AxiosInstance, AxiosError } from 'axios';
import { 
  UsageyError, 
  AuthenticationError, 
  RateLimitError, 
  ValidationError 
} from './errors';

export function createHttpClient(apiKey: string, baseUrl: string): AxiosInstance {
  const client = axios.create({
    baseURL: baseUrl,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'User-Agent': `UsageyNodeSDK/0.1.1 Node/${process.version}`
    }
  });

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (!error.response) {
        throw new UsageyError('Network error', 'network_error');
      }

      const { status, data } = error.response;
      let errorMessage = 'Unknown error';

      if (typeof data === 'string') {
        errorMessage = data;
      } else if (typeof data === 'object' && data !== null) {
        errorMessage = (data as any).message || (data as any).error || 'Unknown error';
      }

      switch (status) {
        case 401:
          throw new AuthenticationError(errorMessage);
        case 402:
          throw new UsageyError(errorMessage, 'payment_required', data);
        case 403:
          throw new UsageyError(errorMessage, 'forbidden', data);
        case 404:
          throw new UsageyError(errorMessage, 'not_found', data);
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