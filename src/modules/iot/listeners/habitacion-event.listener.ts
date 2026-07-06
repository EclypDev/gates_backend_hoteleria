import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { IotService } from '../iot.service';

@Injectable()
export class HabitacionEventListener {
  private readonly logger = new Logger(HabitacionEventListener.name);

  constructor(private readonly iotService: IotService) {}

  @OnEvent('habitacion.checkin')
  async handleHabitacionCheckIn(event: { macAddress: string; pin: number }) {
    this.logger.log(`Reaccionando a checkin para MAC: ${event.macAddress}`);
    try {
      await this.iotService.executeCommand(event.macAddress, {
        pin: event.pin,
        action: 'on',
      });
      this.logger.log(`Comando enviado con éxito a la puerta.`);
    } catch (error) {
      this.logger.error(
        `El hardware con MAC ${event.macAddress} no respondió, pero la gestión hotelera se mantiene intacta.`,
      );
    }
  }
}
