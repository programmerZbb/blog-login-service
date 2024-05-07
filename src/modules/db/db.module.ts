import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User, OauthClient } from '../../db/entities';
import { ConfigService } from '../config/config.service';
import { RedisModule } from '../redis/redis.module';
import { REDIS_CLIENT } from '../redis/constants';

// 用来统一管理db入口
@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      async useFactory(configService: ConfigService) {
        console.log(configService, '---配置如上');
        return await configService.getDbConf([User, OauthClient]);
      },
      inject: [ConfigService],
    }),
    {
      ...TypeOrmModule.forFeature([User, OauthClient]),
      global: true,
    },
    // 注册 Redis module
    RedisModule.forRootAsync({
      async useFactory(configService: ConfigService) {
        return await configService.getRedisConf();
      },
      inject: [ConfigService],
    }),
  ],
})
export class DbModule {}
