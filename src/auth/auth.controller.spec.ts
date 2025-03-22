import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { HttpStatus } from '@nestjs/common';
import { RequestWithUser } from '../common/types/request-with-user.type';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshTokens: jest.fn(),
    logout: jest.fn(),
  };

  const mockUser = {
    id: 'user-id',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'admin',
    organization: {
      id: 'org-id',
      name: 'Test Org',
      slug: 'test-org',
      plan: 'basic',
    },
  };

  const mockAuthResponse = {
    user: mockUser,
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register with registerDto', async () => {
      const registerDto: RegisterDto = {
        email: 'new@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        organizationName: 'New Org',
      };

      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe('login', () => {
    it('should call authService.login with loginDto', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe('refreshTokens', () => {
    it('should call authService.refreshTokens with userId and refreshToken', async () => {
      const request = {
        user: {
          sub: 'user-id',
          refreshToken: 'refresh-token',
        },
      } as RequestWithUser;

      mockAuthService.refreshTokens.mockResolvedValue(mockAuthResponse);

      const result = await controller.refreshTokens(request);

      expect(authService.refreshTokens).toHaveBeenCalledWith(
        request.user.sub,
        request.user.refreshToken,
      );
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe('logout', () => {
    it('should call authService.logout with userId', async () => {
      const userId = 'user-id';
      const mockLogoutResponse = { success: true };

      mockAuthService.logout.mockResolvedValue(mockLogoutResponse);

      const result = await controller.logout(userId);

      expect(authService.logout).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockLogoutResponse);
    });
  });
}); 