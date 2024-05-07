import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { hostname } from 'os';

import { RegisterDiscover } from './modules/etcd/register-discover.service';
import { MicroServiceConf } from './service-conf/micro-service.conf';

@Injectable()
export class AppService implements OnModuleInit {
  @Inject(RegisterDiscover)
  private registerDiscover: RegisterDiscover;

  onModuleInit() {
    this.registerDiscover.registerService(
      MicroServiceConf.serviceName,
      hostname(),
      {
        host: MicroServiceConf.host,
        port: MicroServiceConf.port,
      },
    );
  }
}
