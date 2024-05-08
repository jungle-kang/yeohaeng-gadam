import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateTagDto {
  @ApiProperty({ type: Number, description: '방 기본키 참조' })
  @IsInt()
  @IsOptional()
  room_id: string;

  @ApiProperty({ type: String, description: '태그들', example: ['tag1', 'tag2', 'tag3'] })
  @IsArray()
  @IsOptional()
  tags?: string[] | null;

  constructor(partial: Partial<UpdateTagDto>) {
    Object.assign(this, partial);
  }
  
}
