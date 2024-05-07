import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

import { REDIS_CLIENT } from './constants';

@Injectable()
// ! 注意：redis官方有这个实现，建议别使用 RedisService 命名
export class MyRedisService {
  // @MyInjectRedis()
  @Inject(REDIS_CLIENT)
  private redisClient: RedisClientType;

  // 获取redis列表中所有的值
  async listGet(key: string) {
    return await this.redisClient.lRange(key, 0, -1);
  }

  /**
   * 给Redis中添加一个数组
   */
  async listSet(key: string, list: Array<string>, ttl?: number) {
    await this.redisClient.lPush(key, list);
    // 设置过期时间
    if (ttl) {
      await this.redisClient.expire(key, ttl);
    }
  }

  /**
   * 给 redis 中添加 string 数据
   * ex 是秒数
   */
  async stringSet(key: string, value: string, ex?: number) {
    await this.redisClient.set(key, value, {
      EX: ex,
      NX: true,
    });
  }

  /**
   * 获取 redis 中的 string 数据
   */
  async stringGet(key: string) {
    return await this.redisClient.get(key);
  }

  /**
   * 给 redis 中添加 map
   */
  async mapSet(map: string, info: Record<string, string>) {
    await this.redisClient.hSet(map, {});
  }
}
