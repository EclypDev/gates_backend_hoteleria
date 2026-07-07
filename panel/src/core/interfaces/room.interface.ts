import type { IDevice } from './device.interface';

export interface IBusiness {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  rooms?: IRoom[];
  createdAt: string;
  updatedAt: string;
}

export interface IRoom {
  id: string;
  roomNumber: string;
  floor?: string;
  isActive: boolean;
  businessId: string;
  business?: IBusiness;
  deviceId?: string;
  device?: IDevice;
  doorPin: number;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateBusinessDto {
  name: string;
  description?: string;
}

export interface IUpdateBusinessDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface ICreateRoomDto {
  roomNumber: string;
  floor?: string;
  businessId: string;
  doorPin?: number;
}

export interface IUpdateRoomDto {
  roomNumber?: string;
  floor?: string;
  isActive?: boolean;
  doorPin?: number;
}
