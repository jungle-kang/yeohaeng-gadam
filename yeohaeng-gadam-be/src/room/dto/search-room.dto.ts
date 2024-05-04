import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsDate } from 'class-validator';

export class SearchRoomDto {
  @ApiProperty({ type: Number, description: '방 기본키' })
  @IsInt()
  @IsOptional()
  id?: string;

  @ApiProperty({ type: String, description: '방 제목' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ type: String, description: '목적지' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ type: Number, description: '참가 인원 수' })
  @IsInt()
  @IsOptional()
  hcAttend?: number;

  @ApiProperty({ type: Number, description: '최대 인원 수' })
  @IsInt()
  @IsOptional()
  hcMax?: number;

  @ApiProperty({ type: Number, description: '상태' })
  @IsInt()
  @IsOptional()
  state?: number;

  @ApiProperty({ type: Date, description: '여행 시작 날짜' })
  @IsDate()
  @IsOptional()
  startDate?: string | null;

  @ApiProperty({ type: Date, description: '여행 종료 날짜' })
  @IsDate()
  @IsOptional()
  endDate?: string | null;

  constructor(partial: Partial<SearchRoomDto>) {
    Object.assign(this, partial);
  }
  
}
