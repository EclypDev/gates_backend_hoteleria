import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from '../entities/device.entity';
import type { IMqttService } from '../../../core/interfaces';
import { CORE_TOKENS } from '../../../core/tokens';

interface DeviceAnnouncement {
  macAddress: string;
  status: 'online' | 'offline';
}

@Injectable()
export class DeviceAnnouncementListener implements OnModuleInit {
  private readonly logger = new Logger(DeviceAnnouncementListener.name);

  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    @Inject(CORE_TOKENS.MQTT_SERVICE)
    private readonly mqttService: IMqttService,
  ) {}

  async onModuleInit(): Promise<void> {
    const announcementTopic = 'galaxypos/hardware/announcement';
    
    await this.mqttService.subscribe(announcementTopic);
    this.logger.log(`Subscribed to ${announcementTopic}`);

    this.mqttService.onMessage(async (topic: string, payload: unknown) => {
      if (topic === announcementTopic) {
        await this.handleAnnouncement(payload as DeviceAnnouncement);
      }
    });
  }

  private async handleAnnouncement(announcement: DeviceAnnouncement): Promise<void> {
    try {
      const macAddress = announcement.macAddress.toUpperCase();
      
      let device = await this.deviceRepository.findOne({
        where: { macAddress },
      });

      if (device) {
        device.isOnline = announcement.status === 'online';
        await this.deviceRepository.save(device);
        this.logger.log(`Device ${macAddress} updated: ${announcement.status}`);
      } else {
        device = this.deviceRepository.create({
          macAddress,
          alias: `ESP32-${macAddress.slice(-5)}`,
          isOnline: announcement.status === 'online',
        });
        await this.deviceRepository.save(device);
        this.logger.log(`Device ${macAddress} auto-registered`);
      }
    } catch (error) {
      this.logger.error('Failed to handle device announcement', error);
    }
  }
}
