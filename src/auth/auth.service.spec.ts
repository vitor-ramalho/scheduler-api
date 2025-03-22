import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Mock the bcrypt module
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn().mockImplementation(() => 'hashed-password'),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let usersRepository: Repository<User>;
  let organizationsRepository: Repository<Organization>;
  let configService: ConfigService;

  const mockUser = {
    id: 'user-id',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    password: 'hashed-password',
    role: 'admin',
    isActive: true,
    organizationId: 'org-id',
    refreshToken: 'hashed-refresh-token',
    organization: {
      id: 'org-id',
      name: 'Test Org',
      slug: 'test-org',
      plan: 'basic',
    },
  };

  const mockOrganization = {
    id: 'org-id',
    name: 'Test Org',
    slug: 'test-org',
    plan: 'basic',
    isActive: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockImplementation(() => 'mock-token'),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn().mockResolvedValue({ affected: 1 }),
          },
        },
        {
          provide: getRepositoryToken(Organization),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key) => {
              if (key === 'app.jwt.secret') return 'test-secret';
              if (key === 'app.jwt.expiresIn') return '30d';
              return null;
            }),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    organizationsRepository = module.get<Repository<Organization>>(getRepositoryToken(Organization));
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('login', () => {
    it('should throw UnauthorizedException when user is not found', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);

      await expect(
        authService.login({ email: 'notfound@example.com', password: 'password' })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(mockUser as User);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({ email: 'test@example.com', password: 'wrong-password' })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is not active', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(inactiveUser as User);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(
        authService.login({ email: 'test@example.com', password: 'password' })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return user and tokens when login is successful', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(mockUser as User);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jest.spyOn(authService as any, 'getTokens').mockResolvedValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });
      jest.spyOn(authService as any, 'updateRefreshToken').mockResolvedValue(undefined);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password',
      });

      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          role: mockUser.role,
          organization: {
            id: mockUser.organization.id,
            name: mockUser.organization.name,
            slug: mockUser.organization.slug,
            plan: mockUser.organization.plan,
          },
        },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });
    });
  });

  describe('register', () => {
    const registerDto = {
      email: 'new@example.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
      organizationName: 'New Org',
    };

    it('should throw BadRequestException when email is already in use', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(mockUser as User);

      await expect(authService.register(registerDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when organization name is already in use', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(organizationsRepository, 'findOne').mockResolvedValue(mockOrganization as Organization);

      await expect(authService.register(registerDto)).rejects.toThrow(BadRequestException);
    });

    it('should create organization and user when registration is successful', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(organizationsRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(organizationsRepository, 'create').mockReturnValue(mockOrganization as Organization);
      jest.spyOn(organizationsRepository, 'save').mockResolvedValue(mockOrganization as Organization);
      jest.spyOn(usersRepository, 'create').mockReturnValue(mockUser as User);
      jest.spyOn(usersRepository, 'save').mockResolvedValue(mockUser as User);
      jest.spyOn(authService as any, 'getTokens').mockResolvedValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });
      jest.spyOn(authService as any, 'updateRefreshToken').mockResolvedValue(undefined);

      const result = await authService.register(registerDto);

      expect(organizationsRepository.create).toHaveBeenCalled();
      expect(organizationsRepository.save).toHaveBeenCalled();
      expect(usersRepository.create).toHaveBeenCalled();
      expect(usersRepository.save).toHaveBeenCalled();
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          role: mockUser.role,
          organization: {
            id: mockOrganization.id,
            name: mockOrganization.name,
            slug: mockOrganization.slug,
            plan: mockOrganization.plan,
          },
        },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });
    });
  });

  describe('refreshTokens', () => {
    it('should throw UnauthorizedException when user is not found', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);

      await expect(
        authService.refreshTokens('non-existent-id', 'refresh-token')
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when refresh token is not valid', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(mockUser as User);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.refreshTokens(mockUser.id, 'invalid-refresh-token')
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return new tokens when refresh is successful', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(mockUser as User);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jest.spyOn(authService as any, 'getTokens').mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
      jest.spyOn(authService as any, 'updateRefreshToken').mockResolvedValue(undefined);

      const result = await authService.refreshTokens(mockUser.id, 'valid-refresh-token');

      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          role: mockUser.role,
          organization: {
            id: mockUser.organization.id,
            name: mockUser.organization.name,
            slug: mockUser.organization.slug,
            plan: mockUser.organization.plan,
          },
        },
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
    });
  });

  describe('logout', () => {
    it('should update user to remove refresh token', async () => {
      jest.spyOn(usersRepository, 'update').mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] });

      const result = await authService.logout(mockUser.id);

      expect(usersRepository.update).toHaveBeenCalledWith(mockUser.id, { refreshToken: undefined });
      expect(result).toEqual({ success: true });
    });
  });
}); 