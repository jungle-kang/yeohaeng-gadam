import { IsInt, IsOptional, IsString, IsDate } from 'class-validator';

export class RoomDTO {
  @IsString()
  title: string;

  @IsString()
  location: string;

  @IsInt()
  @IsOptional()
  hcMax?: number;

  @IsDate()
  @IsOptional()
  startDate?: string | null;

  @IsDate()
  @IsOptional()
  endDate?: string | null;

  constructor(partial: Partial<RoomDTO>) {
    Object.assign(this, partial);
  }
}
