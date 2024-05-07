import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ type: Number, description: '방 기본키 참조' })
  @IsInt()
  @IsOptional()
  room_id: string;

  @ApiProperty({ type: String, description: '태그' })
  @IsString()
  @IsOptional()
  tag?: string | null;

  constructor(partial: Partial<CreateTagDto>) {
    Object.assign(this, partial);
  }
  
}
