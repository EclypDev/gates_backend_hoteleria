export type MqttQoS = 0 | 1 | 2;

export interface MqttMessageHandler {
  (topic: string, payload: unknown): void | Promise<void>;
}

export interface IMqttService {
  publish(topic: string, payload: unknown, qos?: MqttQoS): Promise<void>;
  subscribe(topic: string): Promise<void>;
  unsubscribe(topic: string): Promise<void>;
  onMessage(handler: MqttMessageHandler): void;
}
