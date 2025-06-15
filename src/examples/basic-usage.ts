import { UsageyClient } from '../index';

// Replace with your actual API key
const API_KEY = 'your_api_key';

async function main() {
  // Initialize the client
  const usagey = new UsageyClient(API_KEY);

  try {
    // Track a simple usage event
    console.log('Tracking a simple API call event...');
    const simpleEvent = await usagey.trackEvent('api_call');
    console.log('Event tracked successfully:', simpleEvent);

    // Track an event with quantity and metadata
    console.log('\nTracking a data processing event with quantity and metadata...');
    const complexEvent = await usagey.trackEvent('data_processing', 5, {
      dataType: 'images',
      processingType: 'resize',
      batchId: '12345'
    });
    console.log('Event tracked successfully:', complexEvent);

    // Get usage statistics
    console.log('\nFetching usage statistics...');
    const stats = await usagey.getUsageStats();
    console.log('Current usage:', stats.usage);
    console.log(`${stats.usage.currentUsage} / ${stats.usage.limit} (${stats.usage.percentage}%)`);
    console.log(`Current plan: ${stats.usage.plan}`);

    // Get recent usage events
    console.log('\nFetching recent usage events...');
    const events = await usagey.getUsageEvents({
      limit: 5
    });
    console.log(`Retrieved ${events.data.length} events:`);
    console.log(events.data);

  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error);