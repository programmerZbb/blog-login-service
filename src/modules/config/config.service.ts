import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { EntitySchema } from 'typeorm';
import { JwtModuleOptions } from '@nestjs/jwt';
import { RedisClientOptions } from 'redis';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';
import { IOptions as EtcdOptions } from 'etcd3';

interface Config {
  MYSQL: {
    host: string;
    port: number;
    password: string;
    username: string;
  };
  REDIS: {
    host: string;
    port: number;
    password: string;
  };
  UPLOAD: {
    path: string;
  };
  JWT_SECRET: {
    secret: string;
    refresh_secret: string;
  };
  ETCD: {
    hosts: string;
    auth: {
      username: string;
      password: string;
    };
  };
}

@Injectable()
export class ConfigService {
  private config: Config;

  constructor() {
    console.log('当前环境为：', process.env.NODE_ENV);
    const confPath = path.join(
      // process.cwd(),
      __dirname,
      `../../../config/${process.env.NODE_ENV || 'development'}.yaml`,
    );
    this.config = yaml.load(fs.readFileSync(confPath, 'utf-8')) as Config;
  }

  public getDbConf(
    entities: TypeOrmModuleOptions['entities'],
  ): TypeOrmModuleOptions {
    return {
      ...this.config.MYSQL,
      type: 'mysql', // 数据库类型
      database: 'blog',
      synchronize: true, // 设置synchronize可确保每次运行应用程序时实体都将与数据库同步。
      logging: true, // 打印sql语句
      entities,
      migrations: [], // 是修改表结构之类的 sql，暂时用不到，就不展开了
      subscribers: [], //  是一些 Entity 生命周期的订阅者，比如 insert、update、remove 前后，可以加入一些逻辑
      poolSize: 10, // 连接池最大数量
      connectorPackage: 'mysql2', // 驱动包
      // 额外发送给驱动包的一些选项
      extra: {
        authPlugin: 'sha256_password',
      },
    };
  }

  public getJwtConf() {
    return {
      secret: this.config.JWT_SECRET.secret,
      /**
       * access token 过期时间为30min
       */
      expiresIn: '30m',
    };
  }

  public getRefreshJwtConf() {
    return {
      secret: this.config.JWT_SECRET.refresh_secret,
      /**
       * access token 过期时间为30min
       */
      expiresIn: '7d',
    };
  }

  public getRedisConf(): RedisClientOptions {
    return {
      socket: {
        host: this.config.REDIS.host,
        port: this.config.REDIS.port,
      },
      password: this.config.REDIS.password,
    };
  }

  public getEtcdConf(): EtcdOptions {
    return this.config.ETCD;
  }
}
