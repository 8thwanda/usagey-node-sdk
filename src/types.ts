/**
 * Options for configuring the Usagey client
 */
export interface ClientOptions {
  /**
   * Base URL for the Usagey API
   * @default 'https://usagey.com'
   */
  baseUrl?: string;
}

/**
 * Parameters for creating a usage event
 */
export interface UsageEventParams {
  /**
   * The type of event to track
   */
  event_type: string;
  
  /**
   * The quantity of the event
   * @default 1
   */
  quantity?: number;
  
  /**
   * Additional metadata for the event
   */
  metadata?: Record<string, any>;
}

/**
 * Response from tracking a usage event
 */
export interface UsageEventResponse {
  /**
   * Whether the event was successfully recorded
   */
  success: boolean;
  
  /**
   * The ID of the recorded event
   */
  event_id: string;
  
  /**
   * The timestamp when the event was recorded
   */
  timestamp: string;
}

/**
 * Parameters for creating an API key
 */
export interface ApiKeyCreateParams {
  /**
   * A descriptive name for the API key
   */
  name: string;
  
  /**
   * The ID of the organization to create the key for
   */
  organizationId: string;
  
  /**
   * Optional expiration date for the key
   */
  expiresAt?: string;
}

/**
 * Response from creating or regenerating an API key
 */
export interface ApiKeyResponse {
  /**
   * The ID of the API key
   */
  id: string;
  
  /**
   * The name of the API key
   */
  name: string;
  
  /**
   * The API key value (only returned when creating or regenerating)
   */
  key: string;
  
  /**
   * When the API key was created
   */
  createdAt: string;
  
  /**
   * When the API key expires (if applicable)
   */
  expiresAt?: string;
}

/**
 * Response from getting usage statistics
 */
export interface UsageStatsResponse {
  /**
   * Usage statistics
   */
  usage: {
    /**
     * Current usage amount
     */
    currentUsage: number;
    
    /**
     * Usage limit based on subscription plan
     */
    limit: number;
    
    /**
     * Percentage of limit used
     */
    percentage: number;
    
    /**
     * Name of the current subscription plan
     */
    plan: string;
  };
}