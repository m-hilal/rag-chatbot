import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { API_MESSAGES } from '../constants/messages';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException(API_MESSAGES.MISSING_API_KEY);
    }

    const validApiKey = this.configService.get<string>('API_KEY');
    if (!validApiKey) {
      throw new UnauthorizedException(API_MESSAGES.API_KEY_NOT_CONFIGURED);
    }

    if (apiKey !== validApiKey) {
      throw new UnauthorizedException(API_MESSAGES.INVALID_API_KEY);
    }

    return true;
  }
} 