import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call findAll and return a list of users', async () => {
    const result = [{ id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User', password: 'hashed', role: 'user', isActive: true }];
    jest.spyOn(service, 'findAll').mockResolvedValue(result as any);

    expect(await controller.findAll('org-id')).toBe(result);
  });

  it('should call findOne and return a user', async () => {
    const result = { id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User', password: 'hashed', role: 'user', isActive: true };
    jest.spyOn(service, 'findOne').mockResolvedValue(result as any);

    expect(await controller.findOne('1', 'org-id')).toBe(result);
  });

  it('should call create and return the created user', async () => {
    const dto = { email: 'new@example.com', firstName: 'New', lastName: 'User', password: 'hashed', role: 'user' };
    const result = { id: '1', ...dto };
    jest.spyOn(service, 'create').mockResolvedValue(result as any);

    expect(await controller.create(dto, 'org-id')).toBe(result);
  });

  it('should call update and return the updated user', async () => {
    const dto = { firstName: 'Updated' };
    const result = { id: '1', email: 'test@example.com', firstName: 'Updated', lastName: 'User', password: 'hashed', role: 'user', isActive: true };
    jest.spyOn(service, 'update').mockResolvedValue(result as any);

    expect(await controller.update('1', dto, 'org-id')).toBe(result);
  });

  it('should call remove and return undefined', async () => {
    jest.spyOn(service, 'remove').mockResolvedValue(undefined);

    expect(await controller.remove('1', 'org-id')).toBeUndefined();
  });
});
