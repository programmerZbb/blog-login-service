import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OauthClient } from '../../entities/oauth-client.entity';
import { Create, Update } from './oauth-client.vo';

@Injectable()
export class OauthClientRepository {
  @InjectRepository(OauthClient)
  private repository: Repository<OauthClient>;

  public async findOne(params: {
    id?: number;
    clientId?: string;
    clientSecret?: string;
  }) {
    return await this.repository.findOne({
      where: params,
    });
  }

  public async create(user: Create) {
    await this.repository.save(user);
  }

  public async update(user: Update) {
    await this.repository.save(user);
  }

  public async delete(id: number) {
    await this.repository.delete(id);
  }
}
