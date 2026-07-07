import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Business } from './business.entity';
import { Device } from '../../iot/entities/device.entity';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  roomNumber!: string;

  @Column({ nullable: true })
  floor?: string;

  @Column({ default: true })
  isActive!: boolean;

  @ManyToOne(() => Business, (business) => business.rooms, { onDelete: 'CASCADE' })
  business!: Business;

  @Column()
  businessId!: string;

  @OneToOne(() => Device, { nullable: true })
  @JoinColumn()
  device?: Device;

  @Column({ nullable: true })
  deviceId?: string;

  @Column({ default: 2 })
  doorPin!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
