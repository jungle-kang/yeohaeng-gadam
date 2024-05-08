import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class CreateEntryDto {
  @ApiProperty({ type: Number, description: '참가 기본키' })
  @IsInt()
  id?: string;

  @ApiProperty({ type: String, description: '참가한 방' })
  @IsString()
  room_id?: string;

  @ApiProperty({ type: String, description: '참가한 사용자' })
  @IsString()
  user_id?: string;

  constructor(partial: Partial<CreateEntryDto>) {
    Object.assign(this, partial);
  }

}
