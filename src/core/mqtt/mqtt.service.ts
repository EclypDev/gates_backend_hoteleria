import { Injectable, Inject, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { MqttClient } from 'mqtt';
import { IMqttService, MqttQoS, MqttMessageHandler } from '../interfaces';

@Injectable()
export class MqttService implements IMqttService, OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttService.name);
  private readonly handlers: MqttMessageHandler[] = [];

  constructor(
    @Inject('MQTT_CLIENT') private readonly mqttClient: MqttClient,
  ) {}

  onModuleInit(): void {
    this.mqttClient.on('connect', () => {
      this.logger.log('Connected to MQTT broker');
    });

    this.mqttClient.on('error', (error: Error) => {
      this.logger.error('MQTT error:', error.message);
    });

    this.mqttClient.on('message', (topic: string, message: Buffer) => {
      try {
        const payload: unknown = JSON.parse(message.toString());
        void this.notifyHandlers(topic, payload);
      } catch (error) {
        this.logger.warn(`Failed to parse MQTT message on ${topic}:`, error);
      }
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.mqttClient.endAsync();
  }

  async publish(topic: string, payload: unknown, qos: MqttQoS = 1): Promise<void> {
    return new Promise((resolve, reject) => {
      this.mqttClient.publish(topic, JSON.stringify(payload), { qos }, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  async subscribe(topic: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.mqttClient.subscribe(topic, { qos: 1 }, (error) => {
        if (error) {
          reject(error);
        } else {
          this.logger.log(`Subscribed to topic: ${topic}`);
          resolve();
        }
      });
    });
  }

  async unsubscribe(topic: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.mqttClient.unsubscribe(topic, (error) => {
        if (error) {
          reject(error);
        } else {
          this.logger.log(`Unsubscribed from topic: ${topic}`);
          resolve();
        }
      });
    });
  }

  onMessage(handler: MqttMessageHandler): void {
    this.handlers.push(handler);
  }

  private async notifyHandlers(topic: string, payload: unknown): Promise<void> {
    for (const handler of this.handlers) {
      await handler(topic, payload);
    }
  }
}
