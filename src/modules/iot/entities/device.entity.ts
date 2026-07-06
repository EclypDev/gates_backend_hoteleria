import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 17 })
  macAddress!: string;

  @Column({ type: 'varchar', length: 100 })
  alias!: string;

  @Column({ default: false })
  isOnline!: boolean;

  @UpdateDateColumn()
  updatedAt!: Date;
}
