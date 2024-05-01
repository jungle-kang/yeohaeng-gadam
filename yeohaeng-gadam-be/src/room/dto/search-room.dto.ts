import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsDate } from 'class-validator';

export class SearchRoomDto {
  @ApiProperty({ description: '방 기본키' })
  @IsInt()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: '방 제목' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: '목적지' })
  @IsString()
  @IsOptional()
  location?: string;

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
  @IsString()
  @IsOptional()
  tag?: string | null;
}
