import { UsageyClient } from '../index';

// Replace with your actual API key
const API_KEY = 'your_api_key';
// Replace with your organization ID
const ORGANIZATION_ID = 'your_organization_id';

async function main() {
  // Initialize the client
  const usagey = new UsageyClient(API_KEY);

  try {
    // Create a new API key
    console.log('Creating a new API key...');
    const newKey = await usagey.createApiKey('Test API Key', ORGANIZATION_ID);
    console.log('API key created successfully:');
    console.log(`ID: ${newKey.id}`);
    console.log(`Name: ${newKey.name}`);
    console.log(`Key: ${newKey.key}`);
    console.log(`Created at: ${newKey.createdAt}`);

    // Store the key ID for later operations
    const keyId = newKey.id;

    // Wait a moment before continuing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Regenerate the API key
    console.log('\nRegenerating the API key...');
    const regeneratedKey = await usagey.regenerateApiKey(keyId);
    console.log('API key regenerated successfully:');
    console.log(`ID: ${regeneratedKey.id}`);
    console.log(`New key: ${regeneratedKey.key}`);

    // Wait a moment before continuing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Delete the API key
    console.log('\nDeleting the API key...');
    const deleteResult = await usagey.deleteApiKey(keyId);
    console.log('API key deleted successfully:', deleteResult.success);

  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error);