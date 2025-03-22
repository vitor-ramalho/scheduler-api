import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { SchedulingService } from './scheduling.service';
import { Schedule } from './entities/schedule.entity';
import { Appointment } from './entities/appointment.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('scheduling')
@Controller('scheduling')
export class SchedulingController {
  constructor(private readonly schedulingService: SchedulingService) {}

  @ApiOperation({ summary: 'Create a new schedule' })
  @ApiResponse({ status: 201, description: 'Schedule created successfully', type: Schedule })
  @ApiBody({ type: Schedule })
  @Post('schedules')
  createSchedule(@Body() scheduleData: Partial<Schedule>) {
    return this.schedulingService.createSchedule(scheduleData);
  }

  @ApiOperation({ summary: 'Get schedules for a user' })
  @ApiResponse({ status: 200, description: 'List of schedules', type: [Schedule] })
  @ApiParam({ name: 'userId', description: 'ID of the user' })
  @Get('schedules/:userId')
  findSchedules(@Param('userId') userId: string) {
    return this.schedulingService.findSchedules(userId);
  }

  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiResponse({ status: 201, description: 'Appointment created successfully', type: Appointment })
  @ApiBody({ type: Appointment })
  @Post('appointments')
  createAppointment(@Body() appointmentData: Partial<Appointment>) {
    return this.schedulingService.createAppointment(appointmentData);
  }
}
