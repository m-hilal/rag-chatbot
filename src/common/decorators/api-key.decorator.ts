import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const ApiKey = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const apiKey = request.headers['authorization'];

  if (!apiKey || !apiKey.startsWith('Bearer ')) {
    throw new UnauthorizedException('API key is required');
  }

  return apiKey.replace('Bearer ', '');
});