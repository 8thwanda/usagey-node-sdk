import { UsageyClient, AuthenticationError, RateLimitError, ValidationError } from '../index';

// Intentionally invalid API key to demonstrate error handling
const INVALID_API_KEY = 'invalid_api_key';

async function main() {
  // Initialize the client with an invalid API key
  const usagey = new UsageyClient(INVALID_API_KEY);

  try {
    // This call should fail with an authentication error
    console.log('Attempting to track an event with an invalid API key...');
    await usagey.trackEvent('api_call');
  } catch (error) {
    console.log('\nCaught an error:');
    
    if (error instanceof AuthenticationError) {
      console.log('Authentication Error:', error.message);
      console.log('Error code:', error.code);
    } else if (error instanceof RateLimitError) {
      console.log('Rate Limit Error:', error.message);
      console.log('Retry after:', error.retryAfter, 'seconds');
      console.log('Limit:', error.limit);
      console.log('Remaining:', error.remaining);
    } else if (error instanceof ValidationError) {
      console.log('Validation Error:', error.message);
      console.log('Validation errors:', error.errors);
    } else {
      console.log('Unexpected error:', error);
    }
  }

  // Example of handling validation errors
  try {
    // Initialize with a valid API key but pass invalid data
    const validClient = new UsageyClient('valid_api_key_but_invalid_data');
    
    // This would normally fail with a validation error
    console.log('\nAttempting to track an event with invalid data...');
    // @ts-expect-error - Intentionally passing invalid data for demonstration
    await validClient.trackEvent(null);
  } catch (error) {
    console.log('\nCaught another error:');
    
    if (error instanceof ValidationError) {
      console.log('Validation Error:', error.message);
    } else {
      console.log('Unexpected error:', error);
    }
  }
}

main().catch(console.error);