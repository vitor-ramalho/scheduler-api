import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  create(clientData: Partial<Client>) {
    const client = this.clientRepository.create(clientData);
    return this.clientRepository.save(client);
  }

  findAll(organizationId: string) {
    return this.clientRepository.find({ where: { organization: { id: organizationId } } });
  }

  async update(id: string, clientData: Partial<Client>) {
    const client = await this.clientRepository.findOne({ where: { id } });
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    Object.assign(client, clientData);
    return this.clientRepository.save(client);
  }

  async remove(id: string) {
    const client = await this.clientRepository.findOne({ where: { id } });
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    return this.clientRepository.remove(client);
  }
}
