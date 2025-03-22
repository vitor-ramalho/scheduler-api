import { Controller, Get, HttpStatus } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly dataSource: DataSource) {}

  @Get('health')
  @ApiOperation({ summary: 'Check API and database health' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Health check successful',
  })
  @ApiResponse({
    status: HttpStatus.SERVICE_UNAVAILABLE,
    description: 'Health check failed',
  })
  async getHealth(): Promise<{ status: string; database: boolean }> {
    let isDatabaseConnected = false;

    try {
      // Simple query to check database connection
      await this.dataSource.query('SELECT 1');
      isDatabaseConnected = true;
    } catch (error) {
      isDatabaseConnected = false;
    }

    return {
      status: 'online',
      database: isDatabaseConnected,
    };
  }
}
