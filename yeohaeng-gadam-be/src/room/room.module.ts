import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admission } from './entities/admission.entity';
import { Room } from './entities/room.entity';
import { Tag } from './entities/tag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Room, Tag, Admission])],
  controllers: [RoomController],
  providers: [RoomService],
})
export class RoomModule {}
