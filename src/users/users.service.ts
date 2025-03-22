import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUser } from '../common/decorators/get-user.decorator';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findAll(@GetUser('organizationId') organizationId: string) {
    return this.usersRepository.find({ where: { organizationId } });
  }

  async findOne(id: string, @GetUser('organizationId') organizationId: string) {
    const user = await this.usersRepository.findOne({
      where: { id, organizationId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async create(
    createUserDto: CreateUserDto,
    @GetUser('organizationId') organizationId: string,
  ) {
    const user = this.usersRepository.create({
      ...createUserDto,
      organizationId,
    });
    return this.usersRepository.save(user);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    @GetUser('organizationId') organizationId: string,
  ) {
    const user = await this.findOne(id, organizationId);
    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: string, @GetUser('organizationId') organizationId: string) {
    const user = await this.findOne(id, organizationId);
    await this.usersRepository.remove(user);
  }
}
