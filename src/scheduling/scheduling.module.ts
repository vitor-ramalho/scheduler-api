import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schedule } from './entities/schedule.entity';
import { Appointment } from './entities/appointment.entity';
import { SchedulingService } from './scheduling.service';
import { SchedulingController } from './scheduling.controller';
import { ClientsModule } from '../clients/clients.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Schedule, Appointment]),
    ClientsModule, // Import ClientsModule to provide ClientRepository
  ],
  controllers: [SchedulingController],
  providers: [SchedulingService],
})
export class SchedulingModule {}
