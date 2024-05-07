import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as HmacMd5 from 'crypto-js/hmac-md5';
import * as Base64URL from 'crypto-js/enc-base64url';
import { nanoid } from 'nanoid';

import { OauthClientRepository } from '../../db/repositories/oatuh-client/oauth-client.repository';
import { MyRedisService } from '../redis/redis.service';
import { ConfigService } from '../config/config.service';
import { AuthInfo, TokenInfo } from '../../proto-types/oauth2Gprc2';

import { TokenService } from './token.service';

export interface User {
  name: string;
  id: number;
}

/**
 * 用来做身份验证的service
 * 1. 验证token是否有效
 * 2. 返回一个新的token
 * 3. refresh_token相关逻辑
 */
@Injectable()
export class AuthenticationService {
  @Inject(MyRedisService)
  private redisService: MyRedisService;

  @Inject(OauthClientRepository)
  private oauthClientRepository: OauthClientRepository;

  @Inject(TokenService)
  private tokenService: TokenService;

  /**
   * 根据服务名称注册服务
   */
  public async clientRegister(clientName: string) {
    const clientId: string = HmacMd5(clientName, 'client-id').toString(
      Base64URL,
    );
    const clientSecret = nanoid();

    await this.oauthClientRepository.create({
      clientName,
      clientId,
      clientSecret,
    });

    return {
      clientId,
      clientSecret,
    };
  }

  /**
   * 获取oauth code
   */
  public async getOauthCode(clientId: string, user: User) {
    // 客户端id必须存在
    const client = await this.oauthClientRepository.findOne({ clientId });
    if (client == null) {
      throw new Error('未找到该clientId');
    }
    const salt = nanoid();
    // 返回一个url友好的，以防传递过程中出现转移
    const code: string = HmacMd5(user.id, salt).toString(Base64URL);
    // 添加到Redis中，然后返回该code
    const oauth2Info = {
      clientId,
      user,
    };
    await this.redisService.stringSet(code, JSON.stringify(oauth2Info), 5 * 60);
    return {
      code,
    };
  }

  /**
   * oauth2 验证code成功之后返回token信息
   * 1. 需要验证code，code需要clientId对应上，保存在Redis中
   * 2. client_secret 需要和注册时的clientId对应上
   */
  public async verifyAuthCode(authInfo: AuthInfo) {
    // step1 验证 clientId 是否能匹配到 clientSecret
    const res = await this.oauthClientRepository.findOne({
      clientId: authInfo.clientId,
      clientSecret: authInfo.clientSecret,
    });
    if (res == null) {
      throw new Error('未注册该服务');
    }
    // step2 验证code码是否还存在
    const clientInfoStr = await this.redisService.stringGet(authInfo.code);
    if (clientInfoStr == null) {
      throw new Error('验证code失败！');
    }
    const clientInfo = JSON.parse(clientInfoStr);
    const user: User = clientInfo.user;
    return this.tokenService.getToken(user);
  }
}
