import { Module } from '@nestjs/common';

import { UserRepository } from '../../db/repositories/user/user.repository';

import { LoginController } from './login.controller';
import { LoginService } from './login.service';

@Module({
  controllers: [LoginController],
  providers: [UserRepository, LoginService],
})
export class LoginModule {}
