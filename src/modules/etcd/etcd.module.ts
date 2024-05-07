import { Module, DynamicModule, Inject, Provider } from '@nestjs/common';
import { Etcd3 } from 'etcd3';

import { ConfigService } from '../config/config.service';
import { ETCD_CLIENT } from './etcd-constant';
import { RegisterDiscover } from './register-discover.service';

@Module({})
export class EtcdModule {
  static forRoot(): DynamicModule {
    // const client = new Etcd3({
    //   hosts: 'http://127.0.0.1:8088',
    //   auth: {
    //     username: 'root',
    //     password: 'qazplm',
    //   },
    // });

    const providers: Array<Provider> = [
      {
        provide: ETCD_CLIENT,
        useFactory(configService: ConfigService) {
          const etcdConf = configService.getEtcdConf();
          const client = new Etcd3(etcdConf);
          return client;
        },
        inject: [ConfigService],
      },
      RegisterDiscover,
    ];

    return {
      module: EtcdModule,
      global: true,
      providers,
      exports: [RegisterDiscover],
    };
  }
}

export const InjectEtcd = () => Inject(ETCD_CLIENT);
