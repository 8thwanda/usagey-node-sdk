# Usagey Node.js SDK
[![Test](https://github.com/8thwanda/usagey-node-sdk/actions/workflows/test.yml/badge.svg)](https://github.com/8thwanda/usagey-node-sdk/actions/workflows/test.yml)
[![npm version](https://badge.fury.io/js/usagey.svg)](https://badge.fury.io/js/usagey)
[![codecov](https://codecov.io/gh/8thwanda/usagey-node-sdk/branch/main/graph/badge.svg)](https://codecov.io/gh/8thwanda/usagey-node-sdk)

The official Node.js SDK for [Usagey](https://usagey.com) - the complete toolkit for implementing usage-based pricing.

## Installation

```bash
npm install usagey
# or
yarn add usagey
```

## Quick Start

```typescript
import { UsageyClient } from 'usagey';

// Initialize the client with your API key
const usagey = new UsageyClient('your_api_key');

// Track a usage event
async function trackApiCall() {
  try {
    const result = await usagey.trackEvent('api_call', 1, {
      endpoint: '/users',
      method: 'GET'
    });
    console.log('Event tracked:', result.event_id);
  } catch (error) {
    console.error('Error tracking event:', error);
  }
}
```

## Features

- **Usage Tracking**: Track usage events with custom metadata
- **API Key Management**: Create, regenerate, and delete API keys
- **Usage Statistics**: Retrieve usage statistics and limits
- **Type Safety**: Written in TypeScript with full type definitions
- **Error Handling**: Detailed error types for better error handling

## API Reference

### Initialization

```typescript
import { UsageyClient } from 'usagey';

const usagey = new UsageyClient('your_api_key', {
  baseUrl: 'https://api.usagey.com'
});
```

### Tracking Usage Events

```typescript
// Basic usage
await usagey.trackEvent('api_call');

// With quantity
await usagey.trackEvent('data_processing', 5);

// With metadata
await usagey.trackEvent('storage', 10, {
  fileType: 'image',
  sizeInBytes: 1024000
});
```

### Managing API Keys

```typescript
// Create a new API key
const newKey = await usagey.createApiKey('Production API Key', 'org_123456');

// Create an API key with expiration
const expiringKey = await usagey.createApiKey(
  'Temporary API Key',
  'org_123456',
  new Date('2023-12-31')
);

// Regenerate an API key
const regeneratedKey = await usagey.regenerateApiKey('key_123456');

// Delete an API key
await usagey.deleteApiKey('key_123456');
```

### Retrieving Usage Statistics

```typescript
// Get current usage statistics
const stats = await usagey.getUsageStats();
console.log(`Current usage: ${stats.usage.currentUsage} / ${stats.usage.limit}`);
console.log(`Usage percentage: ${stats.usage.percentage}%`);
console.log(`Current plan: ${stats.usage.plan}`);

// Get usage events with filtering
const events = await usagey.getUsageEvents({
  eventType: 'api_call',
  startDate: '2023-01-01',
  endDate: new Date(),
  limit: 100
});
```

## Error Handling

The SDK provides specific error classes for different types of errors:

```typescript
import { UsageyClient, AuthenticationError, RateLimitError, ValidationError } from 'usagey';

const usagey = new UsageyClient('your_api_key');

try {
  await usagey.trackEvent('api_call');
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof RateLimitError) {
    console.error(`Rate limit exceeded. Retry after ${error.retryAfter} seconds`);
  } else if (error instanceof ValidationError) {
    console.error('Validation error:', error.errors);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## License

MIT