import { Module } from '@nestjs/common';
import { EntryService } from './entry.service';
import { EntryController } from './entry.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Entry } from './entities/entry.entity';
import { Room } from 'src/room-tag/entities/room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Entry, Room])],
  controllers: [EntryController],
  providers: [EntryService],
})
export class EntryModule {}
