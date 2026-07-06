import { IsString, IsNotEmpty, Matches, MaxLength } from 'class-validator';

export class RegisterDeviceDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})$/, {
    message: 'macAddress must be in format XX:XX:XX:XX:XX:XX',
  })
  macAddress!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  alias!: string;
}
