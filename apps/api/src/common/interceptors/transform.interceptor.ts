import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  meta?: Record<string, unknown>;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(_: ExecutionContext, next: CallHandler<T>): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        if (data === null || data === undefined) {
          return { data: null as unknown as T };
        }
        if (typeof data === 'object' && 'data' in (data as object) && 'meta' in (data as object)) {
          return data as unknown as Response<T>;
        }
        return { data };
      }),
    );
  }
}
