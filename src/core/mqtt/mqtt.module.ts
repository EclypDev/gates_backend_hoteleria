import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as mqtt from 'mqtt';
import { MqttService } from './mqtt.service';
import { CORE_TOKENS } from '../tokens';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'MQTT_CLIENT',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('MQTT_HOST', 'localhost');
        const port = configService.get<number>('MQTT_PORT', 1883);
        const username = configService.get<string>('MQTT_USERNAME');
        const password = configService.get<string>('MQTT_PASSWORD');

        return mqtt.connect(`mqtt://${host}:${port}`, {
          username,
          password,
          clientId: `galaxypos_${Math.random().toString(16).slice(3)}`,
          clean: true,
          reconnectPeriod: 5000,
        });
      },
    },
    MqttService,
    {
      provide: CORE_TOKENS.MQTT_SERVICE,
      useExisting: MqttService,
    },
  ],
  exports: [MqttService, CORE_TOKENS.MQTT_SERVICE, 'MQTT_CLIENT'],
})
export class MqttModule {}
