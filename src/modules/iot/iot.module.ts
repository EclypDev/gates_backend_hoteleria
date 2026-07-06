import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from './entities/device.entity';
import { IotService } from './iot.service';
import { IotController } from './iot.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Device])],
  controllers: [IotController],
  providers: [IotService],
  exports: [IotService],
})
export class IotModule {}
