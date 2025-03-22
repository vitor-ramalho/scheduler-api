import { Controller, Post, Get, Patch, Delete, Body, Param } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { Client } from './entities/client.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('clients')
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @ApiOperation({ summary: 'Create a new client' })
  @ApiResponse({ status: 201, description: 'Client created successfully', type: Client })
  @ApiBody({ type: Client })
  @Post()
  create(@Body() clientData: Partial<Client>) {
    return this.clientsService.create(clientData);
  }

  @ApiOperation({ summary: 'Get all clients for an organization' })
  @ApiResponse({ status: 200, description: 'List of clients', type: [Client] })
  @ApiParam({ name: 'organizationId', description: 'ID of the organization' })
  @Get(':organizationId')
  findAll(@Param('organizationId') organizationId: string) {
    return this.clientsService.findAll(organizationId);
  }

  @ApiOperation({ summary: 'Update a client' })
  @ApiResponse({ status: 200, description: 'Client updated successfully', type: Client })
  @ApiParam({ name: 'id', description: 'ID of the client' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() clientData: Partial<Client>) {
    return this.clientsService.update(id, clientData);
  }

  @ApiOperation({ summary: 'Delete a client' })
  @ApiResponse({ status: 204, description: 'Client deleted successfully' })
  @ApiParam({ name: 'id', description: 'ID of the client' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientsService.remove(id);
  }
}
