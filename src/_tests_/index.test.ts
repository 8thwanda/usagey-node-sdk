// src/_tests_/index.test.ts
import * as sdk from '../index';
import { UsageyClient } from '../client';
import { UsageyError, AuthenticationError, RateLimitError, ValidationError } from '../errors';

describe('SDK Index', () => {
  it('should export UsageyClient as default', () => {
    expect(sdk.default).toBe(UsageyClient);
  });

  it('should export all named components', () => {
    expect(sdk.UsageyClient).toBe(UsageyClient);
    expect(sdk.UsageyError).toBe(UsageyError);
    expect(sdk.AuthenticationError).toBe(AuthenticationError);
    expect(sdk.RateLimitError).toBe(RateLimitError);
    expect(sdk.ValidationError).toBe(ValidationError);
    expect(sdk.Types).toBeDefined();
  });
});