import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Organization } from '../organizations/entities/organization.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Organization)
    private readonly organizationsRepository: Repository<Organization>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
      relations: ['organization'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User is not active');
    }

    const tokens = await this.getTokens(
      user.id,
      user.email,
      user.role,
      user.organizationId,
    );
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organization: user.organization
          ? {
              id: user.organization.id,
              name: user.organization.name,
              slug: user.organization.slug,
              plan: user.organization.plan,
            }
          : null,
      },
      ...tokens,
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    // Create slug from organization name
    const slug = registerDto.organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const existingOrg = await this.organizationsRepository.findOne({
      where: [{ name: registerDto.organizationName }, { slug }],
    });

    if (existingOrg) {
      throw new BadRequestException('Organization name already in use');
    }

    // Create organization
    const organization = this.organizationsRepository.create({
      name: registerDto.organizationName,
      slug,
    });

    await this.organizationsRepository.save(organization);

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = this.usersRepository.create({
      email: registerDto.email,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      password: hashedPassword,
      isActive: true,
      role: 'admin', // Organization owner is an admin
      organizationId: organization.id,
    });

    await this.usersRepository.save(user);

    const tokens = await this.getTokens(
      user.id,
      user.email,
      user.role,
      user.organizationId,
    );
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organization: {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          plan: organization.plan,
        },
      },
      ...tokens,
    };
  }

  async refreshTokens(userId: string, refreshToken: string | undefined) {
    if (!refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['organization'],
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Access denied');
    }

    const tokens = await this.getTokens(
      user.id,
      user.email,
      user.role,
      user.organizationId,
    );
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organization: user.organization
          ? {
              id: user.organization.id,
              name: user.organization.name,
              slug: user.organization.slug,
              plan: user.organization.plan,
            }
          : null,
      },
      ...tokens,
    };
  }

  async logout(userId: string) {
    await this.usersRepository.update(userId, { refreshToken: undefined });
    return { success: true };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersRepository.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  private async getTokens(
    userId: string,
    email: string,
    role: string,
    organizationId: string | null,
  ) {
    const jwtPayload = {
      sub: userId,
      email,
      role,
      organizationId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('app.jwt.secret'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('app.jwt.secret'),
        expiresIn: this.configService.get<string>('app.jwt.expiresIn'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
