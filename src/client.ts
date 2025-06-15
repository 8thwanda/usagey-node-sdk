import { AxiosInstance } from 'axios';
import { createHttpClient } from './http-client';
import {
  ApiKeyCreateParams,
  ApiKeyResponse,
  UsageEventParams,
  UsageEventResponse,
  UsageStatsResponse,
  ClientOptions
} from './types';

/**
 * Main client for interacting with the Usagey API
 */
export class UsageyClient {
  private httpClient: AxiosInstance;
  private readonly baseUrl: string;

  /**
   * Create a new Usagey client instance
   * 
   * @param apiKey Your Usagey API key
   * @param options Additional client options
   */
  constructor(apiKey: string, options: ClientOptions = {}) {
    this.baseUrl = options.baseUrl || 'https://usagey.com';
    this.httpClient = createHttpClient(apiKey, this.baseUrl);
  }

  /**
   * Track a usage event
   * 
   * @param eventType The type of event to track
   * @param quantity The quantity of the event (default: 1)
   * @param metadata Additional metadata for the event
   * @returns Promise resolving to the created event
   */
  async trackEvent(
    eventType: string,
    quantity: number = 1,
    metadata?: Record<string, any>
  ): Promise<UsageEventResponse> {
    const payload: UsageEventParams = {
      event_type: eventType,
      quantity,
      metadata
    };

    const response = await this.httpClient.post('/api/usage', payload);
    return response.data;
  }

  /**
   * Create a new API key
   * 
   * @param name A descriptive name for the API key
   * @param organizationId The ID of the organization to create the key for
   * @param expiresAt Optional expiration date for the key
   * @returns Promise resolving to the created API key
   */
  async createApiKey(
    name: string,
    organizationId: string,
    expiresAt?: Date
  ): Promise<ApiKeyResponse> {
    const payload: ApiKeyCreateParams = {
      name,
      organizationId,
      expiresAt: expiresAt?.toISOString()
    };

    const response = await this.httpClient.post('/api/api-keys', payload);
    return response.data;
  }

  /**
   * Regenerate an existing API key
   * 
   * @param apiKeyId The ID of the API key to regenerate
   * @returns Promise resolving to the regenerated API key
   */
  async regenerateApiKey(apiKeyId: string): Promise<ApiKeyResponse> {
    const response = await this.httpClient.post(`/api/api-keys/${apiKeyId}/regenerate`);
    return response.data;
  }

  /**
   * Delete an API key
   * 
   * @param apiKeyId The ID of the API key to delete
   * @returns Promise resolving to a success indicator
   */
  async deleteApiKey(apiKeyId: string): Promise<{ success: boolean }> {
    const response = await this.httpClient.delete(`/api/api-keys/${apiKeyId}`);
    return response.data;
  }

  /**
   * Get usage statistics for the current user
   * 
   * @returns Promise resolving to usage statistics
   */
  async getUsageStats(): Promise<UsageStatsResponse> {
    const response = await this.httpClient.get('/api/usage/stats');
    return response.data;
  }

  /**
   * Get usage events with optional filtering
   * 
   * @param options Optional parameters for filtering usage events
   * @returns Promise resolving to a list of usage events
   */
  async getUsageEvents(options: {
    eventType?: string;
    startDate?: string | Date;
    endDate?: string | Date;
    limit?: number;
  } = {}): Promise<{ success: boolean; data: any[] }> {
    const params: Record<string, string | number> = {};
    
    if (options.eventType) {
      params.event_type = options.eventType;
    }
    
    if (options.startDate) {
      params.start_date = options.startDate instanceof Date 
        ? options.startDate.toISOString() 
        : options.startDate;
    }
    
    if (options.endDate) {
      params.end_date = options.endDate instanceof Date 
        ? options.endDate.toISOString() 
        : options.endDate;
    }
    
    if (options.limit) {
      params.limit = options.limit;
    }

    const response = await this.httpClient.get('/api/usage', { params });
    return response.data;
  }
}