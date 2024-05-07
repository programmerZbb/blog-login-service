import { GrpcMethod, RpcException } from '@nestjs/microservices';
import {
  Controller,
  Inject,
  UseFilters,
  Post,
  Body,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ServerUnaryCall,
  Metadata,
  loadPackageDefinition,
} from '@grpc/grpc-js';

import {
  Token,
  User,
  OAUTH2_SERVICE_NAME,
  AuthInfo,
  TokenInfo,
  LogoutRes,
} from '../../proto-types/oauth2Gprc2';
import { GRPCExceptionFilter } from '../../exception-filter/rpc-exception.filter';
import { GrpcException } from '../../exceptions/grpc-exception';
import { OauthClientDto } from './dto/oauth-client.dto';
import { AuthenticationService } from './authentication.service';
import { TokenService } from './token.service';

// @UseFilters(GRPCExceptionFilter)
@Controller('auth')
export class AuthenticationController {
  @Inject(AuthenticationService)
  private authenticationService: AuthenticationService;

  @Inject(TokenService)
  private tokenService: TokenService;

  // 鉴权的微服务
  @GrpcMethod(OAUTH2_SERVICE_NAME, 'verifyToken')
  public verifyToken({ token }: Token, type: 'access' | 'refresh') {
    try {
      return this.tokenService.verifyAccessToken(token);
      // return {
      //   name: 'test',
      //   id: 123456,
      // };
    } catch (err) {
      throw new GrpcException({ code: 4, message: 'token失效！' });
    }
  }

  /**
   * oauth2 获取token的微服务
   * 这里只是一个简单实现，不是完整版的 oauth2 参数实现
   */
  @GrpcMethod(OAUTH2_SERVICE_NAME, 'verifyAuthCode')
  public async verifyAuthCode(authInfo: AuthInfo): Promise<TokenInfo> {
    try {
      const { access_token, refresh_token } =
        await this.authenticationService.verifyAuthCode(authInfo);
      return {
        accessToken: access_token,
        refreshToken: refresh_token,
      };
      // return {
      //   name: 'test',
      //   id: 123456,
      // };
    } catch (err) {
      throw new GrpcException({
        code: 4,
        message: err?.message || '验证code失败',
      });
    }
  }

  /**
   * 刷新token
   */
  @GrpcMethod(OAUTH2_SERVICE_NAME, 'refreshToken')
  public async refreshToken(tokenInfo: TokenInfo) {
    try {
      return await this.tokenService.refreshToken(tokenInfo);
    } catch (err) {
      throw new GrpcException({
        code: 4,
        message: err?.message || '刷新token失败',
      });
    }
  }

  /**
   * 退登 logout
   */
  @GrpcMethod(OAUTH2_SERVICE_NAME, 'logout')
  public async logout(tokenInfo: TokenInfo): Promise<LogoutRes> {
    try {
      await this.tokenService.addTokenInBlackList(tokenInfo);
      return {
        message: '退登成功',
      };
    } catch (err) {
      throw new GrpcException({
        code: 4,
        message: err?.message || '刷新token失败',
      });
    }
  }

  /**
   * 给第三方服务提供注册的http服务
   */
  @Post('client-register')
  public async clientRegister(@Body() body: OauthClientDto) {
    try {
      await this.authenticationService.clientRegister(body.clientName);
      return '注册成功';
    } catch (error) {
      throw new InternalServerErrorException('客户端注册失败');
    }
  }
}
