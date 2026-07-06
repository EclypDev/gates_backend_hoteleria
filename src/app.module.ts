import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './core/database/database.module';
import { MqttModule } from './core/mqtt/mqtt.module';
import { RedisModule } from './core/redis/redis.module';
import { UsersModule } from './core/users/users.module';
import { AuthModule } from './core/auth/auth.module';
import { IotModule } from './modules/iot/iot.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    MqttModule,
    RedisModule,
    UsersModule,
    AuthModule,
    IotModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
