import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { Device } from '../iot/entities/device.entity';
import type { IRoomService, CreateRoomDto, UpdateRoomDto } from '../interfaces/room-service.interface';
import type { IMqttService } from '../../../core/interfaces';
import { CORE_TOKENS } from '../../../core/tokens';

@Injectable()
export class RoomService implements IRoomService {
  private readonly logger = new Logger(RoomService.name);

  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    @Inject(CORE_TOKENS.MQTT_SERVICE)
    private readonly mqttService: IMqttService,
  ) {}

  async findAll(): Promise<Room[]> {
    return this.roomRepository.find({
      relations: ['business', 'device'],
      order: { roomNumber: 'ASC' },
    });
  }

  async findById(id: string): Promise<Room | null> {
    return this.roomRepository.findOne({
      where: { id },
      relations: ['business', 'device'],
    });
  }

  async findByBusinessId(businessId: string): Promise<Room[]> {
    return this.roomRepository.find({
      where: { businessId },
      relations: ['business', 'device'],
      order: { roomNumber: 'ASC' },
    });
  }

  async create(data: CreateRoomDto): Promise<Room> {
    const room = this.roomRepository.create(data);
    return this.roomRepository.save(room);
  }

  async update(id: string, data: UpdateRoomDto): Promise<Room> {
    const room = await this.findById(id);
    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }
    Object.assign(room, data);
    return this.roomRepository.save(room);
  }

  async delete(id: string): Promise<void> {
    const result = await this.roomRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }
  }

  async assignDevice(roomId: string, deviceId: string): Promise<Room> {
    const room = await this.findById(roomId);
    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }

    const device = await this.deviceRepository.findOne({ where: { id: deviceId } });
    if (!device) {
      throw new NotFoundException(`Device with ID ${deviceId} not found`);
    }

    // Verificar que el dispositivo no esté asignado a otra habitación
    const existingAssignment = await this.roomRepository.findOne({
      where: { deviceId },
    });
    if (existingAssignment && existingAssignment.id !== roomId) {
      throw new NotFoundException(`Device is already assigned to room ${existingAssignment.roomNumber}`);
    }

    room.deviceId = deviceId;
    return this.roomRepository.save(room);
  }

  async removeDevice(roomId: string): Promise<Room> {
    const room = await this.findById(roomId);
    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }

    room.deviceId = undefined;
    return this.roomRepository.save(room);
  }

  async openDoor(roomId: string): Promise<void> {
    const room = await this.findById(roomId);
    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }

    if (!room.device || !room.deviceId) {
      throw new NotFoundException(`No device assigned to room ${room.roomNumber}`);
    }

    if (!room.device.isOnline) {
      throw new NotFoundException(`Device for room ${room.roomNumber} is offline`);
    }

    const mac = room.device.macAddress;
    const pin = room.doorPin;

    this.logger.log(`Opening door for room ${room.roomNumber} - MAC: ${mac}, Pin: ${pin}`);

    await this.mqttService.publish(`galaxypos/hardware/cmd/${mac}`, {
      pin,
      action: 'on',
    });

    // Enviar comando de cierre después de 2 segundos (simulación de apertura temporal)
    setTimeout(async () => {
      try {
        await this.mqttService.publish(`galaxypos/hardware/cmd/${mac}`, {
          pin,
          action: 'off',
        });
        this.logger.log(`Door closed for room ${room.roomNumber}`);
      } catch (error) {
        this.logger.error(`Failed to close door for room ${room.roomNumber}`, error);
      }
    }, 2000);
  }

  async closeDoor(roomId: string): Promise<void> {
    const room = await this.findById(roomId);
    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }

    if (!room.device || !room.deviceId) {
      throw new NotFoundException(`No device assigned to room ${room.roomNumber}`);
    }

    if (!room.device.isOnline) {
      throw new NotFoundException(`Device for room ${room.roomNumber} is offline`);
    }

    const mac = room.device.macAddress;
    const pin = room.doorPin;

    this.logger.log(`Closing door for room ${room.roomNumber} - MAC: ${mac}, Pin: ${pin}`);

    await this.mqttService.publish(`galaxypos/hardware/cmd/${mac}`, {
      pin,
      action: 'off',
    });
  }
}
