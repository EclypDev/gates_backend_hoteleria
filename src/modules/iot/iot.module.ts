import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from './entities/device.entity';
import { IotService } from './iot.service';
import { IotController } from './iot.controller';
import { DeviceAnnouncementListener } from './listeners/device-announcement.listener';

@Module({
  imports: [TypeOrmModule.forFeature([Device])],
  controllers: [IotController],
  providers: [IotService, DeviceAnnouncementListener],
  exports: [IotService],
})
export class IotModule {}
