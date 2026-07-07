import type { Business } from '../entities/business.entity';
import type { Room } from '../entities/room.entity';

export interface IBusinessService {
  findAll(): Promise<Business[]>;
  findById(id: string): Promise<Business | null>;
  create(data: CreateBusinessDto): Promise<Business>;
  update(id: string, data: UpdateBusinessDto): Promise<Business>;
  delete(id: string): Promise<void>;
}

export interface IRoomService {
  findAll(): Promise<Room[]>;
  findById(id: string): Promise<Room | null>;
  findByBusinessId(businessId: string): Promise<Room[]>;
  create(data: CreateRoomDto): Promise<Room>;
  update(id: string, data: UpdateRoomDto): Promise<Room>;
  delete(id: string): Promise<void>;
  assignDevice(roomId: string, deviceId: string): Promise<Room>;
  removeDevice(roomId: string): Promise<Room>;
  openDoor(roomId: string): Promise<void>;
  closeDoor(roomId: string): Promise<void>;
}

export interface CreateBusinessDto {
  name: string;
  description?: string;
}

export interface UpdateBusinessDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateRoomDto {
  roomNumber: string;
  floor?: string;
  businessId: string;
  doorPin?: number;
}

export interface UpdateRoomDto {
  roomNumber?: string;
  floor?: string;
  isActive?: boolean;
  doorPin?: number;
}
