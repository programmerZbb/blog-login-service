import {
  Controller,
  Get,
  Post,
  Body,
  Inject,
  InternalServerErrorException,
  HttpCode,
} from '@nestjs/common';
import { Response } from 'express';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginService } from './login.service';

@Controller()
export class LoginController {
  @Inject(LoginService)
  private LoginService: LoginService;

  @HttpCode(200)
  @Post('login')
  public async login(@Body() loginInfo: LoginDto) {
    const res = await this.LoginService.login(loginInfo);
    // 如果是oauth的场景，需要重定向
    if (
      loginInfo.responseType === 'code' &&
      loginInfo.clientId != null &&
      loginInfo.redirectUri != null
    ) {
      return {
        redirectUri: loginInfo.redirectUri,
        ...res,
      };
    }
    return res;
  }

  @Post('register')
  public async register(@Body() body: RegisterDto) {
    return this.LoginService.register(body);
  }
}
