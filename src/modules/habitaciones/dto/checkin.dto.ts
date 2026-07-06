import { IsNumber, IsString, Min, Max } from 'class-validator';

export class CheckInDto {
  @IsString()
  reservaId!: string;

  @IsNumber()
  @Min(0)
  @Max(255)
  pinPuerta!: number;
}
