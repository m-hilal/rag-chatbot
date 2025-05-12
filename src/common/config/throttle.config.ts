import { ThrottlerModuleOptions } from '@nestjs/throttler';

export const throttleConfig: ThrottlerModuleOptions = {
  throttlers: [{
    ttl: 60, // 1 minute
    limit: 10, // 10 requests per minute
  }],
  errorMessage: 'Too many requests. Please try again later.',
  ignoreUserAgents: [], // Don't ignore any user agents
  storage: undefined, // Use in-memory storage
  skipIf: (req) => false, // Don't skip any requests
}; 