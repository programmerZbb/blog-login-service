/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "grpctest";

export interface itemId {
  id: number;
}

export interface Info {
  id: number;
  name: string;
}

export const GRPCTEST_PACKAGE_NAME = "grpctest";

/** 定义一个服务 */

export interface GrpcServiceClient {
  testGrpc(request: itemId): Observable<Info>;
}

/** 定义一个服务 */

export interface GrpcServiceController {
  testGrpc(request: itemId): Promise<Info> | Observable<Info> | Info;
}

export function GrpcServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["testGrpc"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("GrpcService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("GrpcService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const GRPC_SERVICE_NAME = "GrpcService";
