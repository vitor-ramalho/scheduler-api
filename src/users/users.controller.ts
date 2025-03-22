import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of users' })
  @Roles('admin')
  @Get()
  findAll(@GetUser('organizationId') organizationId: string) {
    return this.usersService.findAll(organizationId);
  }

  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User details' })
  @Roles('admin')
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @GetUser('organizationId') organizationId: string,
  ) {
    return this.usersService.findOne(id, organizationId);
  }

  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User created' })
  @Roles('admin')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createUserDto: CreateUserDto,
    @GetUser('organizationId') organizationId: string,
  ) {
    return this.usersService.create(createUserDto, organizationId);
  }

  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User updated' })
  @Roles('admin')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser('organizationId') organizationId: string,
  ) {
    return this.usersService.update(id, updateUserDto, organizationId);
  }

  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'User deleted' })
  @Roles('admin')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @GetUser('organizationId') organizationId: string,
  ) {
    return this.usersService.remove(id, organizationId);
  }
}
