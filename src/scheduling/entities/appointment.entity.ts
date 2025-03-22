import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Schedule } from './schedule.entity';
import { Client } from '../../clients/entities/client.entity';

@Entity({ name: 'appointments' })
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  clientName: string;

  @Column()
  clientEmail: string;

  @ManyToOne(() => Schedule, (schedule) => schedule.id)
  schedule: Schedule;

  @ManyToOne(() => User, (user) => user.appointments)
  user: User;

  @ManyToOne(() => Client, (client) => client.appointments)
  client: Client;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
