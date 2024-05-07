import { Catch, RpcExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class GRPCExceptionFilter implements RpcExceptionFilter<RpcException> {
  catch(exception: RpcException, host: ArgumentsHost): Observable<any> {
    const error = exception.getError() as object;
    // 定制异常不起作用，grpc有固定的异常格式
    return throwError(() => ({
      ...error,
      timestamp: new Date().toISOString(),
    }));
  }
}
