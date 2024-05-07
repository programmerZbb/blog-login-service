import { Module } from '@nestjs/common';

import { LoginModule } from './modules/login/login.module';
import { ConfigModule } from './modules/config/config.module';
// db相关
import { DbModule } from './modules/db/db.module';
// authentication
import { AuthenticationModule } from './modules/authentication/authentication.module';
// etcd配置中心
import { EtcdModule } from './modules/etcd/etcd.module';

import { AppService } from './app.service';

@Module({
  imports: [
    DbModule,
    ConfigModule,
    LoginModule,
    AuthenticationModule,
    // 包含etcd的链接
    EtcdModule.forRoot(),
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
