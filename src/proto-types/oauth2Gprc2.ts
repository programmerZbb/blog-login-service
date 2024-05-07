/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "oauth2Gprc";

export interface Token {
  token: string;
}

export interface User {
  id: number;
  name: string;
}

export interface AuthInfo {
  clientId: string;
  clientSecret: string;
  code: string;
}

export interface TokenInfo {
  accessToken: string;
  /** string */
  refreshToken: string;
}

export interface LogoutRes {
  message: string;
}

export const OAUTH2_GPRC_PACKAGE_NAME = "oauth2Gprc";

/** 定义一个服务 */

export interface Oauth2ServiceClient {
  verifyToken(request: Token): Observable<User>;

  verifyAuthCode(request: AuthInfo): Observable<TokenInfo>;

  refreshToken(request: TokenInfo): Observable<TokenInfo>;

  logout(request: TokenInfo): Observable<LogoutRes>;
}

/** 定义一个服务 */

export interface Oauth2ServiceController {
  verifyToken(request: Token): Promise<User> | Observable<User> | User;

  verifyAuthCode(request: AuthInfo): Promise<TokenInfo> | Observable<TokenInfo> | TokenInfo;

  refreshToken(request: TokenInfo): Promise<TokenInfo> | Observable<TokenInfo> | TokenInfo;

  logout(request: TokenInfo): Promise<LogoutRes> | Observable<LogoutRes> | LogoutRes;
}

export function Oauth2ServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["verifyToken", "verifyAuthCode", "refreshToken", "logout"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("Oauth2Service", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("Oauth2Service", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const OAUTH2_SERVICE_NAME = "Oauth2Service";
