import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { resolve } from 'path';

import { SuccessInterceptor } from './interceptors/success.interceptor';
import { protobufPackage } from './proto-types/oauth2Gprc2';

import { MicroServiceConf } from './service-conf/micro-service.conf';
import { AppModule } from './app.module';

const microServiceUrl = `${MicroServiceConf.host}:${MicroServiceConf.port}`;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: process.env.NODE_ENV === 'development',
  });
  // authentication micro service
  const authenticationService: MicroserviceOptions = {
    transport: Transport.GRPC,
    options: {
      package: protobufPackage,
      protoPath: resolve(__dirname, './proto/oauth2Gprc2.proto'),
      url: microServiceUrl,
      loader: {
        includeDirs: [resolve(__dirname, './proto/oauth2Gprc2.proto')],
      },
    },
  };
  // 提供jwt认证微服务
  // const jwtMicroService: MicroserviceOptions = {
  //   transport: Transport.GRPC,
  //   options: {
  //     package: 'grpctest', // grpc 包名称
  //     protoPath: resolve(__dirname, './proto/oauth2Gprc.proto'), // 协议绝对路径
  //     url: '127.0.0.1:8081', // 连接网址，默认 localhost:5000
  //     // credentials: '', // 凭证
  //     loader: {
  //       includeDirs: [resolve(__dirname, './proto/oauth2Gprc.proto')],
  //     },
  //   },
  // };
  const microservices = app.connectMicroservice(authenticationService);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new SuccessInterceptor());
  await app.startAllMicroservices();
  await app.listen(8082);
}
bootstrap();
