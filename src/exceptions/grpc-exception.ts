import { RpcException } from '@nestjs/microservices';

export class GrpcException extends RpcException {
  // grpc 返回的错误格式，参考：https://blog.csdn.net/u012107512/article/details/80095625
  constructor(error: { message: string; code: number }) {
    super(error);
  }
}
