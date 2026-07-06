import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { IotService } from './iot.service';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { DeviceCommandDto } from './dto/device-command.dto';
import { Device } from './entities/device.entity';

@Controller('iot')
export class IotController {
  constructor(private readonly iotService: IotService) {}

  @Get('devices')
  async findAll(): Promise<Device[]> {
    return this.iotService.findAll();
  }

  @Post('devices')
  async register(@Body() dto: RegisterDeviceDto): Promise<Device> {
    return this.iotService.register(dto);
  }

  @Post('devices/:mac/command')
  @HttpCode(HttpStatus.OK)
  async executeCommand(
    @Param('mac') mac: string,
    @Body() dto: DeviceCommandDto,
  ): Promise<void> {
    await this.iotService.executeCommand(mac, dto);
  }
}
