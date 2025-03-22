import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../users/entities/user.entity';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let usersRepository: any;

  const mockUser = {
    id: 'user-id',
    email: 'test@example.com',
    isActive: true,
    role: 'admin',
    organizationId: 'org-id',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'app.jwt.secret') {
                return 'test-secret';
              }
              return null;
            }),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    usersRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(jwtStrategy).toBeDefined();
  });

  describe('validate', () => {
    it('should throw UnauthorizedException when user is not found', async () => {
      const payload = {
        sub: 'non-existent-id',
        email: 'test@example.com',
        role: 'admin',
        organizationId: 'org-id',
      };

      usersRepository.findOne.mockResolvedValue(null);

      await expect(jwtStrategy.validate(payload)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is not active', async () => {
      const payload = {
        sub: 'user-id',
        email: 'test@example.com',
        role: 'admin',
        organizationId: 'org-id',
      };

      const inactiveUser = { ...mockUser, isActive: false };
      usersRepository.findOne.mockResolvedValue(inactiveUser);

      await expect(jwtStrategy.validate(payload)).rejects.toThrow(UnauthorizedException);
    });

    it('should return user payload when validation is successful', async () => {
      const payload = {
        sub: 'user-id',
        email: 'test@example.com',
        role: 'admin',
        organizationId: 'org-id',
      };

      usersRepository.findOne.mockResolvedValue(mockUser);

      const result = await jwtStrategy.validate(payload);

      expect(result).toEqual(payload);
    });
  });
}); 