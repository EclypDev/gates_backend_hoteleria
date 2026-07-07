import { IsString, IsOptional, IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  roomNumber!: string;

  @IsString()
  @IsOptional()
  floor?: string;

  @IsString()
  @IsNotEmpty()
  businessId!: string;

  @IsNumber()
  @Min(0)
  @Max(34)
  @IsOptional()
  doorPin?: number;
}

export class UpdateRoomDto {
  @IsString()
  @IsOptional()
  roomNumber?: string;

  @IsString()
  @IsOptional()
  floor?: string;

  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @Min(0)
  @Max(34)
  @IsOptional()
  doorPin?: number;
}

export class AssignDeviceDto {
  @IsString()
  @IsNotEmpty()
  deviceId!: string;
}
