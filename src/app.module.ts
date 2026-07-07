import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './core/database/database.module';
import { MqttModule } from './core/mqtt/mqtt.module';
import { RedisModule } from './core/redis/redis.module';
import { UsersModule } from './core/users/users.module';
import { AuthModule } from './core/auth/auth.module';
import { IotModule } from './modules/iot/iot.module';
import { HabitacionesModule } from './modules/habitaciones/habitaciones.module';
import { TestModule } from './core/test/test.module';
import { RoomsModule } from './modules/rooms/rooms.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    DatabaseModule,
    MqttModule,
    RedisModule,
    UsersModule,
    AuthModule,
    IotModule,
    HabitacionesModule,
    TestModule,
    RoomsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
