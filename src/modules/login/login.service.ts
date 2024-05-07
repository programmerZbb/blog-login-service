import {
  Injectable,
  Inject,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as HmacMd5 from 'crypto-js/hmac-md5';
import { nanoid } from 'nanoid';

import { RegisterDto } from './dto/register.dto';
import { UpdateDto } from './dto/update.dto';
import { LoginDto } from './dto/login.dto';
import { AuthenticationService } from '../authentication/authentication.service';
import { TokenService } from '../authentication/token.service';

import { UserRepository } from '../../db/repositories/user/user.repository';
import { User } from '../../db/entities/user.entity';

/**
 * 登录服务，只有登录相关的能力，如果需要鉴权需要找微服务提供的鉴权能力
 * 1. 提供登录注册能力
 * 2. 提供退登能力
 */
@Injectable()
export class LoginService {
  @Inject(UserRepository)
  private userRepository: UserRepository;
  @Inject(AuthenticationService)
  private authenticationService: AuthenticationService;
  @Inject(TokenService)
  private tokenService: TokenService;

  private transformPassword(password: string, salt: string): string {
    return HmacMd5(password, salt).toString();
  }

  public async register(newUser: RegisterDto) {
    let foundUser: User | null = null;
    try {
      foundUser = await this.userRepository.findOne({ name: newUser.name });
    } catch (err) {
      // 需要进行error转义！
      throw new InternalServerErrorException('DB connect error');
    }
    if (foundUser == null) {
      // 需要把用户的真实密码转义
      const user = new User();
      user.name = newUser.name;
      user.salt = nanoid();
      user.password = this.transformPassword(newUser.password, user.salt);
      await this.userRepository.create(user);
      return '注册成功';
    } else {
      throw new BadRequestException('用户已存在');
    }
  }

  public async update(updateUser: UpdateDto) {
    const foundUser = await this.userRepository.findOne({ id: updateUser.id });
    if (foundUser != null) {
      foundUser.name = updateUser.name;
      foundUser.password = this.transformPassword(
        updateUser.password,
        foundUser.salt,
      );
      foundUser.updateTime = new Date();
      await this.userRepository.update(foundUser);
      return '修改成功';
    } else {
      throw new BadRequestException('用户不存在');
    }
  }

  /**
   * 登录能力：主要是对账号密码进行验证，验证通过就返回一个token
   * 抛出验证失败错误，一般不需要额外处理，直接由异常过滤器捕获
   */
  public async login(loginInfo: LoginDto) {
    const foundUser = await this.userRepository.findOne({
      name: loginInfo.name,
    });

    if (foundUser == null) {
      throw new BadRequestException('用户不存在');
    }

    if (
      foundUser.password !==
      this.transformPassword(loginInfo.password, foundUser.salt)
    ) {
      throw new BadRequestException('账号密码错误');
    }

    // 如果是code响应方式，验证完成之后需要返回一个code
    if (
      loginInfo.responseType === 'code' &&
      loginInfo.clientId != null &&
      loginInfo.redirectUri != null
    ) {
      return await this.authenticationService.getOauthCode(loginInfo.clientId, {
        name: foundUser.name,
        id: foundUser.id,
      });
    }

    // 其他方式都返回token信息
    return this.tokenService.getToken({
      name: foundUser.name,
      id: foundUser.id,
    });
  }
}
