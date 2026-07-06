import { IsNumber, IsString, IsIn, Min, Max } from 'class-validator';

export class DeviceCommandDto {
  @IsNumber()
  @Min(0)
  @Max(255)
  pin!: number;

  @IsString()
  @IsIn(['on', 'off'])
  action!: 'on' | 'off';
}
