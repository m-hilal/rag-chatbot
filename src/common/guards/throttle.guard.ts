import { Injectable, Logger } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  private readonly logger = new Logger(CustomThrottlerGuard.name);

  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Get the real IP address, considering proxy headers
    const ip = req.headers['x-forwarded-for'] || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress || 
               req.ip;
    
    // Get user agent to identify the client
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    // Log the request details for debugging
    this.logger.debug(`Request from IP: ${ip}, User-Agent: ${userAgent}`);
    
    // For Postman requests, use a combination of IP and endpoint
    if (userAgent.includes('Postman')) {
      const endpoint = req.originalUrl || req.url;
      return `postman-${ip}-${endpoint}`;
    }
    
    // For other clients, use IP and user agent
    return `${ip}-${userAgent}`;
  }

  async canActivate(context: any): Promise<boolean> {
    const result = await super.canActivate(context);
    if (!result) {
      this.logger.warn('Rate limit exceeded');
    }
    return result;
  }
} 