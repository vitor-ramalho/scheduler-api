import { Test, TestingModule } from '@nestjs/testing';
import { SchedulingService } from './scheduling.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Schedule } from './entities/schedule.entity';
import { Appointment } from './entities/appointment.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('SchedulingService', () => {
  let service: SchedulingService;
  let scheduleRepository: Repository<Schedule>;
  let appointmentRepository: Repository<Appointment>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulingService,
        {
          provide: getRepositoryToken(Schedule),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Appointment),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SchedulingService>(SchedulingService);
    scheduleRepository = module.get<Repository<Schedule>>(getRepositoryToken(Schedule));
    appointmentRepository = module.get<Repository<Appointment>>(getRepositoryToken(Appointment));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSchedule', () => {
    it('should create and save a schedule', async () => {
      const scheduleData = { title: 'Test Schedule', startTime: new Date(), endTime: new Date() };
      const createdSchedule = { id: '1', ...scheduleData };

      jest.spyOn(scheduleRepository, 'create').mockReturnValue(createdSchedule as Schedule);
      jest.spyOn(scheduleRepository, 'save').mockResolvedValue(createdSchedule as Schedule);

      const result = await service.createSchedule(scheduleData);

      expect(scheduleRepository.create).toHaveBeenCalledWith(scheduleData);
      expect(scheduleRepository.save).toHaveBeenCalledWith(createdSchedule);
      expect(result).toEqual(createdSchedule);
    });
  });

  describe('findSchedules', () => {
    it('should return schedules for a user', async () => {
      const userId = 'user-id';
      const schedules = [{ id: '1', title: 'Test Schedule' }];

      jest.spyOn(scheduleRepository, 'find').mockResolvedValue(schedules as Schedule[]);

      const result = await service.findSchedules(userId);

      expect(scheduleRepository.find).toHaveBeenCalledWith({ where: { user: { id: userId } } });
      expect(result).toEqual(schedules);
    });
  });

  describe('createAppointment', () => {
    it('should create and save an appointment', async () => {
      const appointmentData = {
        clientName: 'John Doe',
        clientEmail: 'john@example.com',
        schedule: {
          id: '1',
          title: 'Test Schedule',
          startTime: new Date(),
          endTime: new Date(),
          isAvailable: true,
          user: {
            id: 'user-id',
            email: 'user@example.com',
            firstName: 'User',
            lastName: 'Example',
            password: 'hashed-password',
            role: 'user',
            isActive: true,
            organizationId: 'org-id',
            organization: { id: 'org-id', name: 'Test Org', slug: 'test-org', plan: 'basic' },
            schedules: [],
            appointments: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        client: { id: 'client-id' },
      };
      const schedule = { ...appointmentData.schedule };
      const createdAppointment = { id: '1', ...appointmentData };

      jest.spyOn(scheduleRepository, 'findOne').mockResolvedValue(schedule as any);
      jest.spyOn(scheduleRepository, 'save').mockResolvedValue({ ...schedule, isAvailable: false } as any);
      jest.spyOn(appointmentRepository, 'create').mockReturnValue(createdAppointment as any);
      jest.spyOn(appointmentRepository, 'save').mockResolvedValue(createdAppointment as any);

      const result = await service.createAppointment(appointmentData);

      expect(scheduleRepository.findOne).toHaveBeenCalledWith({ where: { id: '1', isAvailable: true } });
      expect(scheduleRepository.save).toHaveBeenCalledWith({ ...schedule, isAvailable: false });
      expect(appointmentRepository.create).toHaveBeenCalledWith(appointmentData);
      expect(appointmentRepository.save).toHaveBeenCalledWith(createdAppointment);
      expect(result).toEqual(createdAppointment);
    });

    it('should throw NotFoundException if schedule is not available', async () => {
      const appointmentData = {
        clientName: 'John Doe',
        clientEmail: 'john@example.com',
        schedule: { id: '1' },
      };

      jest.spyOn(scheduleRepository, 'findOne').mockResolvedValue(null);

      await expect(service.createAppointment(appointmentData)).rejects.toThrow(NotFoundException);
    });
  });
});
