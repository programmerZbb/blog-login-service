import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as HmacMd5 from 'crypto-js/hmac-md5';
import * as Base64URL from 'crypto-js/enc-base64url';
import { nanoid } from 'nanoid';

import { UserRepository } from '../../db/repositories/user/user.repository';
import { MyRedisService } from '../redis/redis.service';
import { ConfigService } from '../config/config.service';

export interface User {
  name: string;
  id: number;
}

const TOKEN_REDIS_SERVICE = 'login:token:blacklist:';

@Injectable()
export class TokenService {
  @Inject(JwtService)
  private jwtService: JwtService;

  @Inject(UserRepository)
  private userRepository: UserRepository;

  @Inject(ConfigService)
  private configService: ConfigService;

  @Inject(MyRedisService)
  private redisService: MyRedisService;

  /**
   * 1. 不能在黑名单中
   * 2. 验证access_token
   */
  public async verifyAccessToken(token: string) {
    const inBlacklist = await this.inBlacklist(token);
    if (inBlacklist) {
      throw new Error('token已失效');
    }
    return this.verifyToken(token, 'access');
  }

  /**
   * 抛出jwt验证error，需要单独处理
   */
  public verifyToken(token: string, type: 'access' | 'refresh') {
    const secret =
      type === 'access'
        ? this.configService.getJwtConf().secret
        : this.configService.getRefreshJwtConf().secret;
    return this.jwtService.verify<User>(token, {
      secret,
    });
  }

  /**
   * 获取token
   * 一般情况都是第三方服务通过后端微服务请求来获取的
   */
  public getToken(user: User) {
    const access_token = this.jwtService.sign(
      {
        name: user.name,
        id: user.id,
      },
      this.configService.getJwtConf(),
    );
    const refresh_token = this.jwtService.sign(
      {
        name: user.name,
        id: user.id,
      },
      this.configService.getRefreshJwtConf(),
    );
    return {
      access_token,
      refresh_token,
    };
  }

  /**
   * 刷新token
   * 1. 需要把refresh_token和access_token都加入到黑名单中
   * 2. 需要验证refresh_token的正确性
   */
  public async refreshToken({
    refreshToken,
    accessToken,
  }: {
    refreshToken: string;
    accessToken: string;
  }) {
    // 是否在黑名单中
    const inBlacklist = await this.inBlacklist(refreshToken);
    if (inBlacklist) {
      throw new Error('token已失效');
    }

    // 不抛出错误，让下一级处理
    const info = this.verifyToken(refreshToken, 'refresh');
    const user = await this.userRepository.findOne({
      id: info.id,
    });
    if (user != null) {
      // 更新token之前需要把旧的refresh token加到黑名单中
      // await this.addBlackList(refreshToken, 7 * 24 * 3600);
      await this.addTokenInBlackList({
        accessToken,
        refreshToken,
      });
      // await this.addBlackList(accessToken, 5 * 60);
      return this.getToken(user);
    }
    throw new Error('token已失效');
  }

  /**
   * 退登
   */
  public async addTokenInBlackList({
    refreshToken,
    accessToken,
  }: {
    refreshToken: string;
    accessToken: string;
  }) {
    await this.addBlackList(refreshToken, 7 * 24 * 3600);
    await this.addBlackList(accessToken, 5 * 60);
  }

  /**
   * 是否在黑名单中
   */
  public async inBlacklist(token: string): Promise<boolean> {
    const key = `${TOKEN_REDIS_SERVICE}${token}`;
    const result = await this.redisService.stringGet(key);

    return result === '1';
  }

  /**
   * token 黑名单，主要用作退登，更新token等场景
   */
  public async addBlackList(token: string, expires: number) {
    const key = `${TOKEN_REDIS_SERVICE}${token}`;
    await this.redisService.stringSet(key, '1', expires);
  }
}
