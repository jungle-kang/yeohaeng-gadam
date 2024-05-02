import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsDate } from 'class-validator';

export class CreateRoomTagDto {
  @ApiProperty({ description: '방 기본키' })
  @IsInt()
  id?: string;

  @ApiProperty({ description: '방 제목' })
  @IsString()
  title: string;

  @ApiProperty({ description: '목적지' })
  @IsString()
  location: string;

  @ApiProperty({ description: '최대 인원 수' })
  @IsInt()
  @IsOptional()
  hcMax?: number;

  @ApiProperty({ description: '여행 시작 날짜' })
  @IsDate()
  @IsOptional()
  startDate?: string | null;

  @ApiProperty({ description: '여행 종료 날짜' })
  @IsDate()
  @IsOptional()
  endDate?: string | null;

  @ApiProperty({ description: '태그' })
  @IsInt()
  @IsOptional()
  tag?: string  | null;

  constructor(partial: Partial<CreateRoomTagDto>) {
    Object.assign(this, partial);
  }
}
