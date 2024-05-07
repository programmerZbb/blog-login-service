import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { SuccessRes } from '../types/api-types';

/**
 * 一个全局的拦截器，主要是对成功的数据进行组装，返回特定的形式
 * * 利用的 interceptor 的拦截能力
 */
@Injectable()
export class SuccessInterceptor implements NestInterceptor<any, SuccessRes> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<SuccessRes> {
    return next.handle().pipe(
      map((data) => ({
        code: 200,
        success: true,
        data,
      })),
    );
  }
}
