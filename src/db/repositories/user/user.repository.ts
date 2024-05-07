import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RegisterDto } from '../../../modules/login/dto/register.dto';
import { User } from '../../entities/user.entity';
import { Create, Update } from './user.vo';

@Injectable()
export class UserRepository {
  @InjectRepository(User)
  private repository: Repository<User>;

  public async findOne(params: { id?: number; name?: string }) {
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
}
