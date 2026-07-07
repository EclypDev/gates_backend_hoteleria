import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from './entities/business.entity';
import { Room } from './entities/room.entity';
import { Device } from '../iot/entities/device.entity';
import { BusinessService } from './services/business.service';
import { RoomService } from './services/room.service';
import { BusinessController } from './controllers/business.controller';
import { RoomController } from './controllers/room.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Business, Room, Device])],
  controllers: [BusinessController, RoomController],
  providers: [BusinessService, RoomService],
  exports: [BusinessService, RoomService],
})
export class RoomsModule {}
