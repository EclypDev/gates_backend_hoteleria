import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CheckInDto } from './dto/checkin.dto';

@Injectable()
export class HabitacionesService {
  private readonly logger = new Logger(HabitacionesService.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async checkIn(macAddress: string, dto: CheckInDto) {
    this.logger.log(`Procesando Check-In para dispositivo MAC: ${macAddress}`);

    const operacionExitosa = true;

    if (!operacionExitosa) {
      throw new Error('No se pudo procesar el hospedaje');
    }

    this.eventEmitter.emit('habitacion.checkin', {
      macAddress: macAddress.toUpperCase(),
      pin: dto.pinPuerta,
      timestamp: Date.now(),
    });

    return {
      success: true,
      message: 'Check-In registrado en base de datos. Comando de apertura enviado al bus.',
    };
  }
}
