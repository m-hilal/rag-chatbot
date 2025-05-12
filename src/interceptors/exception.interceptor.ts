import * as R from 'ramda';
import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { firstValueFrom, isObservable, Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Response } from 'express';

@Injectable()
export class ExceptionInterceptor implements NestInterceptor {
  constructor() {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>(); // Get the Express Response object

    const firstValue = await firstValueFrom(
      next
        .handle()
        .pipe(
          catchError(async (err) => {
            console.log(`Error intercepted: ${err.message}`);

            // Handle generalized error details extraction
            const { message, statusCode, errorCode, validations } = this.extractErrorDetails(err);

            const userFriendlyMessage = typeof message === 'string' ? R.pipe(R.replace(/\(.*$/, ''), R.trim)(message) : message;

            // Check if it's an SSE stream
            if (response.getHeader('Content-Type') === 'text/event-stream; charset=utf-8') {
              // Format and send the error as an SSE event
              response.write(
                `event: error\ndata: ${JSON.stringify({
                  message: userFriendlyMessage || 'An unexpected error occurred',
                  errorCode: errorCode || undefined,
                  validations: validations || undefined,
                  details: err?.response?.details || undefined,
                  statusCode: statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
                })}\n\n`,
              );
              response.end(); // Close the SSE stream
              return of(); // Stop further processing
            }

            // Fallback for non-SSE responses
            return throwError(
              () =>
                new HttpException(
                  {
                    message: userFriendlyMessage || undefined,
                    errorCode: errorCode || undefined,
                    validations: validations || undefined,
                    details: err?.response?.details || undefined,
                  },
                  statusCode || HttpStatus.INTERNAL_SERVER_ERROR, // Fallback for status code
                ),
            );
          }),
        )
        .pipe(catchError((err) => of(err))),
    );

    return isObservable(firstValue)
      ? firstValue
      : new Observable((subscriber) => {
          subscriber.next(firstValue);
          subscriber.complete();
        });
  }

  private extractErrorDetails(err: any): {
    message?: string;
    statusCode?: number;
    errorCode?: string;
    validations?: string[];
  } {
    let message: string = err.message;
    let statusCode: number =
      err && typeof err.getStatus === 'function' ? err.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode: string | undefined;
    let validations: string[] | undefined;

    const response = err?.response; // Generalized response object
    const data = response?.data; // Extracted data, if available

    if (data) {
      message = data.detail;
      errorCode = data.status_code;
      statusCode = response.status;
    }

    // Extract validations if present in the response
    validations = response?.message?.length > 0 ? response.message : undefined;

    return { message, statusCode, errorCode, validations };
  }
}