import { UsageyClient, AuthenticationError, RateLimitError } from '../index';

// Replace with your actual API key
const API_KEY = 'your_api_key';

// Example of a more advanced usage pattern with proper error handling and retry logic
async function main() {
  // Initialize the client
  const usagey = new UsageyClient(API_KEY, {
    baseUrl: process.env.USAGEY_API_URL // Use environment variable if available
  });

  // Function to track an event with retry logic
  async function trackEventWithRetry(
    eventType: string, 
    quantity: number = 1, 
    metadata?: Record<string, any>,
    maxRetries: number = 3,
    initialDelay: number = 1000
  ) {
    let retries = 0;
    let delay = initialDelay;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        return await usagey.trackEvent(eventType, quantity, metadata);
      } catch (error) {
        // If we've used all our retries, or it's not a rate limit error, rethrow
        if (retries >= maxRetries || !(error instanceof RateLimitError)) {
          throw error;
        }

        // Calculate backoff delay (use retry-after if available, otherwise exponential backoff)
        const retryAfter = error instanceof RateLimitError && error.retryAfter 
          ? error.retryAfter * 1000 
          : delay;

        console.log(`Rate limit exceeded. Retrying in ${retryAfter/1000} seconds...`);
        
        // Wait for the retry delay
        await new Promise(resolve => setTimeout(resolve, retryAfter));
        
        // Increase the delay for next retry (exponential backoff)
        delay *= 2;
        retries++;
      }
    }
  }

  // Batch tracking function for efficiently tracking multiple events
  async function trackBatchEvents(events: Array<{
    eventType: string;
    quantity?: number;
    metadata?: Record<string, any>;
  }>) {
    const results = [];
    
    for (const event of events) {
      try {
        const result = await trackEventWithRetry(
          event.eventType,
          event.quantity || 1,
          event.metadata
        );
        results.push({ success: true, event: event, result });
      } catch (error) {
        results.push({ success: false, event: event, error });
      }
    }
    
    return results;
  }

  try {
    // Track a batch of events
    console.log('Tracking a batch of events...');
    const batchResults = await trackBatchEvents([
      { eventType: 'api_call', metadata: { endpoint: '/users', method: 'GET' } },
      { eventType: 'data_processing', quantity: 10, metadata: { type: 'image_resize' } },
      { eventType: 'storage', quantity: 5, metadata: { type: 'file_upload' } }
    ]);
    
    console.log('Batch results:');
    batchResults.forEach((result, index) => {
      if (result.success) {
        console.log(`Event ${index + 1}: Success - ID: ${result.result?.event_id || 'unknown'}`);
      } else {
        const errorMessage = result.error instanceof Error ? result.error.message : String(result.error);
        console.log(`Event ${index + 1}: Failed - ${errorMessage}`);
      }
    });

    // Get usage stats
    const stats = await usagey.getUsageStats();
    console.log('\nCurrent usage stats:');
    console.log(`${stats.usage.currentUsage} / ${stats.usage.limit} (${stats.usage.percentage}%)`);

  } catch (error) {
    if (error instanceof AuthenticationError) {
      console.error('Authentication error. Please check your API key.');
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

main().catch(console.error);