import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { OauthClientRepository } from '../../db/repositories/oatuh-client/oauth-client.repository';
import { UserRepository } from '../../db/repositories/user/user.repository';

import { ConfigService } from '../config/config.service';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { TokenService } from './token.service';

@Global()
@Module({
  providers: [
    TokenService,
    AuthenticationService,
    OauthClientRepository,
    UserRepository,
  ],
  imports: [
    {
      ...JwtModule.registerAsync({
        async useFactory(configService: ConfigService) {
          return await configService.getJwtConf();
        },
        inject: [ConfigService],
      }),
      global: true,
    },
  ],
  exports: [TokenService, AuthenticationService],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
