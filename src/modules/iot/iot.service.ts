import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from './entities/device.entity';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { DeviceCommandDto } from './dto/device-command.dto';
import type { IMqttService, IRedisService } from '../../core/interfaces';
import { CORE_TOKENS } from '../../core/tokens';

@Injectable()
export class IotService {
  private readonly logger = new Logger(IotService.name);
  private static readonly REDIS_STATE_TTL = 300;

  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    @Inject(CORE_TOKENS.MQTT_SERVICE)
    private readonly mqttService: IMqttService,
    @Inject(CORE_TOKENS.REDIS_SERVICE)
    private readonly redisService: IRedisService,
  ) {}

  async findAll(): Promise<Device[]> {
    return this.deviceRepository.find();
  }

  async register(dto: RegisterDeviceDto): Promise<Device> {
    const mac = dto.macAddress.toUpperCase();
    let device = await this.deviceRepository.findOne({
      where: { macAddress: mac },
    });

    if (device) {
      device.alias = dto.alias;
      device = await this.deviceRepository.save(device);
    } else {
      device = this.deviceRepository.create({
        macAddress: mac,
        alias: dto.alias,
        isOnline: false,
      });
      device = await this.deviceRepository.save(device);
    }

    return device;
  }

  async executeCommand(mac: string, dto: DeviceCommandDto): Promise<void> {
    const macNormalized = mac.toUpperCase();
    const device = await this.deviceRepository.findOne({
      where: { macAddress: macNormalized },
    });

    if (!device) {
      throw new NotFoundException(`Device with MAC ${macNormalized} not found`);
    }

    const topic = `galaxypos/hardware/cmd/${macNormalized}`;
    const payload = { pin: dto.pin, action: dto.action };

    await this.mqttService.publish(topic, payload);

    void this.updateRedisState(macNormalized, dto);
  }

  private async updateRedisState(
    mac: string,
    dto: DeviceCommandDto,
  ): Promise<void> {
    try {
      const key = `iot:device:${mac}:state`;
      const field = `pin${dto.pin}`;
      const value = dto.action === 'on' ? '1' : '0';

      await this.redisService.hset(key, field, value);
      await this.redisService.expire(key, IotService.REDIS_STATE_TTL);
    } catch (error) {
      this.logger.error('Failed to update Redis state', error);
    }
  }
}
