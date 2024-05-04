import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateTagDto {
  @ApiProperty({ type: Number, description: '방 기본키' })
  @IsInt()
  @IsOptional()
  roomId: string;

  @ApiProperty({ type: String, description: '태그들' })
  @IsArray()
  @IsOptional()
  tags?: string[] | null;

  constructor(partial: Partial<UpdateTagDto>) {
    Object.assign(this, partial);
  }
  
}
