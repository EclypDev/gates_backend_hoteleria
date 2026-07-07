import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { RoomService } from '../services/room.service';
import type { CreateRoomDto, UpdateRoomDto, AssignDeviceDto } from '../dto/room.dto';
import type { Room } from '../entities/room.entity';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  async findAll(): Promise<Room[]> {
    return this.roomService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Room | null> {
    return this.roomService.findById(id);
  }

  @Get('business/:businessId')
  async findByBusiness(@Param('businessId') businessId: string): Promise<Room[]> {
    return this.roomService.findByBusinessId(businessId);
  }

  @Post()
  async create(@Body() dto: CreateRoomDto): Promise<Room> {
    return this.roomService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateRoomDto): Promise<Room> {
    return this.roomService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    return this.roomService.delete(id);
  }

  @Post(':id/device')
  async assignDevice(@Param('id') id: string, @Body() dto: AssignDeviceDto): Promise<Room> {
    return this.roomService.assignDevice(id, dto.deviceId);
  }

  @Delete(':id/device')
  async removeDevice(@Param('id') id: string): Promise<Room> {
    return this.roomService.removeDevice(id);
  }

  @Post(':id/open')
  @HttpCode(HttpStatus.OK)
  async openDoor(@Param('id') id: string): Promise<{ success: boolean; message: string }> {
    await this.roomService.openDoor(id);
    return { success: true, message: 'Door opened successfully' };
  }

  @Post(':id/close')
  @HttpCode(HttpStatus.OK)
  async closeDoor(@Param('id') id: string): Promise<{ success: boolean; message: string }> {
    await this.roomService.closeDoor(id);
    return { success: true, message: 'Door closed successfully' };
  }
}
