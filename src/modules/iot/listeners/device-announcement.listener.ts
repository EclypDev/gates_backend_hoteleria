import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
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

    // Iniciar verificación de heartbeat cada 30 segundos
    setInterval(() => {
      void this.checkHeartbeat();
    }, 30000);

    this.logger.log('Heartbeat checker started (30s interval)');
  }

  private async handleAnnouncement(announcement: DeviceAnnouncement): Promise<void> {
    try {
      const macAddress = announcement.macAddress.toUpperCase();
      
      let device = await this.deviceRepository.findOne({
        where: { macAddress },
      });

      if (device) {
        device.isOnline = announcement.status === 'online';
        device.updatedAt = new Date();
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

  private async checkHeartbeat(): Promise<void> {
    try {
      const threshold = new Date(Date.now() - 60000); // 60 segundos
      
      // Buscar dispositivos online que no han actualizado en 60 segundos
      const staleDevices = await this.deviceRepository.find({
        where: {
          isOnline: true,
          updatedAt: LessThan(threshold),
        },
      });

      for (const device of staleDevices) {
        device.isOnline = false;
        await this.deviceRepository.save(device);
        this.logger.warn(`Device ${device.macAddress} marked offline (no heartbeat)`);
      }
    } catch (error) {
      this.logger.error('Failed to check heartbeat', error);
    }
  }
}
