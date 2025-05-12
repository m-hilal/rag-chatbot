import { Reflector } from "@nestjs/core";
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  SetMetadata,
} from "@nestjs/common";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

export interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
}

export const SkipTransformInterceptor = () =>
  SetMetadata("skipTransform", true);

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const skipTransform = this.reflector.get<boolean>(
      "skipTransform",
      context.getHandler(),
    );

    if (skipTransform) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => ({
        statusCode: context.switchToHttp().getResponse().statusCode,
        data: data,
        message: "Success",
      })),
    );
  }
}
