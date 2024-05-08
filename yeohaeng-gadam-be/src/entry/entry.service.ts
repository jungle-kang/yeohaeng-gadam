import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Entry } from './entities/entry.entity';

@Injectable()
export class EntryService {
  constructor(
    @InjectRepository(Entry) private entryRepository: Repository<Entry>,
  ) {}

  async findAll(): Promise<Entry[]>{
    return await this.entryRepository.find();
  }

  async findRoomWithUser(user_id: string): Promise<any[]> {
    const roomIdList = await this.entryRepository.query(`
      SELECT
        room_id
      FROM
        entry
      WHERE
        user_id = '${user_id}';
    `);

    return roomIdList;
  }

}
