import { Test, TestingModule } from '@nestjs/testing';
import { ClientsService } from './clients.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('ClientsService', () => {
  let service: ClientsService;
  let clientRepository: Repository<Client>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        {
          provide: getRepositoryToken(Client),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
    clientRepository = module.get<Repository<Client>>(getRepositoryToken(Client));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a client', async () => {
      const clientData = { name: 'John Doe', email: 'john@example.com' };
      const createdClient = { id: '1', ...clientData };

      jest.spyOn(clientRepository, 'create').mockReturnValue(createdClient as Client);
      jest.spyOn(clientRepository, 'save').mockResolvedValue(createdClient as Client);

      const result = await service.create(clientData);

      expect(clientRepository.create).toHaveBeenCalledWith(clientData);
      expect(clientRepository.save).toHaveBeenCalledWith(createdClient);
      expect(result).toEqual(createdClient);
    });
  });

  describe('findAll', () => {
    it('should return all clients for an organization', async () => {
      const organizationId = 'org-id';
      const clients = [{ id: '1', name: 'John Doe', email: 'john@example.com' }];

      jest.spyOn(clientRepository, 'find').mockResolvedValue(clients as Client[]);

      const result = await service.findAll(organizationId);

      expect(clientRepository.find).toHaveBeenCalledWith({ where: { organization: { id: organizationId } } });
      expect(result).toEqual(clients);
    });
  });

  describe('update', () => {
    it('should update and save a client', async () => {
      const clientData = { name: 'Updated Name' };
      const existingClient = { id: '1', name: 'John Doe', email: 'john@example.com' };

      jest.spyOn(clientRepository, 'findOne').mockResolvedValue(existingClient as Client);
      jest.spyOn(clientRepository, 'save').mockResolvedValue({ ...existingClient, ...clientData } as Client);

      const result = await service.update('1', clientData);

      expect(clientRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(clientRepository.save).toHaveBeenCalledWith({ ...existingClient, ...clientData });
      expect(result).toEqual({ ...existingClient, ...clientData });
    });

    it('should throw NotFoundException if client does not exist', async () => {
      jest.spyOn(clientRepository, 'findOne').mockResolvedValue(null);

      await expect(service.update('1', { name: 'Updated Name' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a client', async () => {
      const existingClient = { id: '1', name: 'John Doe', email: 'john@example.com' };

      jest.spyOn(clientRepository, 'findOne').mockResolvedValue(existingClient as Client);
      jest.spyOn(clientRepository, 'remove').mockResolvedValue(existingClient as Client);

      const result = await service.remove('1');

      expect(clientRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(clientRepository.remove).toHaveBeenCalledWith(existingClient);
      expect(result).toEqual(existingClient);
    });

    it('should throw NotFoundException if client does not exist', async () => {
      jest.spyOn(clientRepository, 'findOne').mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
});
