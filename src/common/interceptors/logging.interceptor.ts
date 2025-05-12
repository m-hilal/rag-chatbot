import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Inject } from '@nestjs/common';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly loggerService: Logger,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, query, params, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (data) => {
          const response = context.switchToHttp().getResponse();
          const delay = Date.now() - startTime;

          this.loggerService.log(
            {
              message: `${method} ${url} ${response.statusCode} ${delay}ms`,
              method,
              url,
              statusCode: response.statusCode,
              delay,
              ip,
              userAgent,
              body,
              query,
              params,
              response: data,
            },
            LoggingInterceptor.name,
          );
        },
        error: (error) => {
          const delay = Date.now() - startTime;

          this.loggerService.error(
            {
              message: `${method} ${url} ${error.status || 500} ${delay}ms`,
              method,
              url,
              statusCode: error.status || 500,
              delay,
              ip,
              userAgent,
              body,
              query,
              params,
              error: error.message,
              stack: error.stack,
            },
            LoggingInterceptor.name,
          );
        },
      }),
    );
  }
} 