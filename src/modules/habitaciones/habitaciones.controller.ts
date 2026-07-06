import { Controller, Post, Param, Body } from '@nestjs/common';
import { HabitacionesService } from './habitaciones.service';
import { CheckInDto } from './dto/checkin.dto';

@Controller('habitaciones')
export class HabitacionesController {
  constructor(private readonly habitacionesService: HabitacionesService) {}

  @Post(':mac/checkin')
  async checkIn(@Param('mac') mac: string, @Body() dto: CheckInDto) {
    return this.habitacionesService.checkIn(mac, dto);
  }
}
