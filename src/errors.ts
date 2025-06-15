/**
 * Base error class for all Usagey SDK errors
 */
export class UsageyError extends Error {
  readonly code: string;
  readonly data?: any;

  constructor(message: string, code: string = 'unknown_error', data?: any) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.data = data;
    
    // This is necessary for proper error subclassing in TypeScript
    Object.setPrototypeOf(this, UsageyError.prototype);
  }
}

/**
 * Error thrown when authentication fails (invalid API key)
 */
export class AuthenticationError extends UsageyError {
  constructor(message: string = 'Invalid API key or authentication failed') {
    super(message, 'authentication_error');
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Error thrown when rate limits are exceeded
 */
export class RateLimitError extends UsageyError {
  readonly retryAfter?: number;
  readonly limit?: number;
  readonly remaining?: number;

  constructor(message: string = 'Rate limit exceeded', data?: any) {
    super(message, 'rate_limit_error', data);
    
    if (data) {
      this.retryAfter = data.retry_after;
      this.limit = data.limit;
      this.remaining = data.remaining;
    }
    
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * Error thrown when request validation fails
 */
export class ValidationError extends UsageyError {
  readonly errors?: Record<string, string[]>;

  constructor(message: string = 'Validation failed', data?: any) {
    super(message, 'validation_error', data);
    
    if (data && data.details) {
      this.errors = data.details;
    }
    
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}