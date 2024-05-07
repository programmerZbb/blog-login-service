import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class OauthClient {
  @PrimaryGeneratedColumn({
    comment: '主键',
  })
  id: number;

  @Column({
    length: 20,
    comment: '客户端名称',
  })
  clientName: string;

  @Column({
    length: 50,
    comment: '客户端id',
  })
  clientId: string;

  @Column({
    length: 50,
    comment: '客户端秘钥',
  })
  clientSecret: string;
}
