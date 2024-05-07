import { Module, DynamicModule, Global, Inject } from '@nestjs/common';
import { createClient, RedisClientOptions } from 'redis';

import { REDIS_CLIENT, REDIS_CLIENT_ASYNC } from './constants';
import { MyRedisService } from './redis.service';

/**
 * 自己实现的 RedisModule，非常实用！
 * * 建议直接使用 redis service，方法全都在那里处理，而不是直接使用 redis client
 */
@Global()
@Module({})
export class RedisModule {
  static async forRoot(option: RedisClientOptions): Promise<DynamicModule> {
    const client = createClient(option);
    await client.connect();

    const providers = [
      {
        provide: REDIS_CLIENT,
        useValue: client,
      },
    ];

    return {
      module: RedisModule,
      providers,
      exports: providers,
      global: true,
    };
  }

  // 真正异步的是 provider，module 本身不是Promise的
  static forRootAsync(option: {
    useFactory: (
      ...args: any[]
    ) => Promise<RedisClientOptions> | RedisClientOptions;
    inject?: any[];
  }): DynamicModule {
    const providers = [
      {
        provide: REDIS_CLIENT_ASYNC,
        useFactory: option.useFactory,
        inject: option.inject,
      },
      {
        provide: REDIS_CLIENT,
        async useFactory(option: RedisClientOptions) {
          const client = createClient(option);
          await client.connect();
          return client;
        },
        inject: [REDIS_CLIENT_ASYNC],
      },
      MyRedisService,
    ];

    return {
      module: RedisModule,
      providers,
      exports: providers,
      global: true,
    };
  }
}

export const MyInjectRedis = () => Inject(REDIS_CLIENT);
