import { Module } from '@nestjs/common';
import { RoomService } from './room-tag.service';
import { RoomController } from './room-tag.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Entry } from '../entry/entities/entry.entity';
import { Room } from './entities/room.entity';
import { Tag } from './entities/tag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Room, Tag, Entry])],
  controllers: [RoomController],
  providers: [RoomService],
})
export class RoomTagModule {}
