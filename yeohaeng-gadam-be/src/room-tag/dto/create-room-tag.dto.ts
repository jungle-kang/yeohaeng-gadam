import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsDate, IsArray } from 'class-validator';

export class CreateRoomTagDto {
  @ApiProperty({ type: Number, description: '방 기본키' })
  @IsInt()
  id?: string;

  @ApiProperty({ type: String, description: '방 제목' })
  @IsString()
  title?: string;

  @ApiProperty({ type: String, description: '목적지' })
  @IsString()
  location?: string;
  
  @ApiProperty({ type: Number, description: '상태' })
  @IsInt()
  @IsOptional()
  state?: number;

  @ApiProperty({ type: Number, description: '참가 인원 수' })
  @IsInt()
  @IsOptional()
  hc_attend?: number;

  @ApiProperty({ type: Number, description: '최대 인원 수' })
  @IsInt()
  @IsOptional()
  hc_max?: number;

  @ApiProperty({ type: String, description: '방장' })
  @IsString()
  hd_id?: string;

  @ApiProperty({ type: Date, description: '여행 시작 날짜', example: "2000-00-00" })
  @IsDate()
  @IsOptional()
  start_date?: string | null;

  @ApiProperty({ type: Date, description: '여행 종료 날짜', example: "2000-00-00" })
  @IsDate()
  @IsOptional()
  end_date?: string | null;

  @ApiProperty({ type: [String], description: '태그들' })
  @IsArray()
  @IsOptional()
  tags?: string[] | null;

  constructor(partial: Partial<CreateRoomTagDto>) {
    Object.assign(this, partial);
  }
  
}
