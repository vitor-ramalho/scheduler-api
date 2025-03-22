import { Test, TestingModule } from '@nestjs/testing';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';
import { ConfigService } from '@nestjs/config';

describe('JwtRefreshStrategy', () => {
  let jwtRefreshStrategy: JwtRefreshStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtRefreshStrategy,
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
      ],
    }).compile();

    jwtRefreshStrategy = module.get<JwtRefreshStrategy>(JwtRefreshStrategy);
  });

  it('should be defined', () => {
    expect(jwtRefreshStrategy).toBeDefined();
  });

  describe('validate', () => {
    it('should extract refresh token from request and add it to payload', () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer refresh-token-123',
        },
      };

      const payload = {
        sub: 'user-id',
        email: 'test@example.com',
        role: 'admin',
        organizationId: 'org-id',
      };

      const result = jwtRefreshStrategy.validate(mockRequest as any, payload);

      expect(result).toEqual({
        ...payload,
        refreshToken: 'refresh-token-123',
      });
    });

    it('should return payload with undefined refreshToken when authorization header is missing', () => {
      const mockRequest = {
        headers: {},
      };

      const payload = {
        sub: 'user-id',
        email: 'test@example.com',
        role: 'admin',
        organizationId: 'org-id',
      };

      const result = jwtRefreshStrategy.validate(mockRequest as any, payload);

      expect(result).toEqual({
        ...payload,
        refreshToken: undefined,
      });
    });
  });
}); 