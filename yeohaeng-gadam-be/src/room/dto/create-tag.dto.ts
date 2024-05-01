import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsDate } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ description: '방 기본키' })
  @IsInt()
  @IsOptional()
  roomId: string;

  @ApiProperty({ description: '태그' })
  @IsString()
  @IsOptional()
  tag?: string | null;

  constructor(partial: Partial<CreateTagDto>) {
    Object.assign(this, partial);
  }
}