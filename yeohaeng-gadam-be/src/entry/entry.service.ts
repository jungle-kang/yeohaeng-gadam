import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Entry } from './entities/entry.entity';
import { Room } from 'src/room-tag/entities/room.entity';

@Injectable()
export class EntryService {
  constructor(
    @InjectRepository(Room) private roomRepository: Repository<Room>,
    @InjectRepository(Entry) private entryRepository: Repository<Entry>,
  ) {}

  async findAll(): Promise<Entry[]>{
    return await this.entryRepository.find();
  }

  async findRoomWithTagsByUser(user_id: string): Promise<any[]> {
    const roomIdList: string[] = (await this.entryRepository.query(`
      SELECT
        room_id
      FROM
        entry
      WHERE
        user_id = '${user_id}';
    `)).map((item: any) => item.room_id).flat();

    return await this.roomRepository.query(`
    SELECT
      room.id AS room_id, 
      room.title, 
      room.location, 
      room.state, 
      room.hc_attend,
      room.hc_max, 
      room.hd_id, 
      DATE_FORMAT(room.start_date, '%Y-%m-%d') AS start_date,
      DATE_FORMAT(room.end_date, '%Y-%m-%d') AS end_date,
      JSON_ARRAYAGG(tag.tag) AS tags
    FROM 
      yeohaeng_gadam.room
    LEFT JOIN 
      yeohaeng_gadam.tag ON room.id = tag.room_id
    WHERE 
      room.id IN (${roomIdList})
    GROUP BY 
        room.id
    ORDER BY 
      room.start_date ASC, room.state ASC, room.hc_attend ASC, room.hc_max ASC;
    `);
  }

  async findUserByRoom(room_id: string): Promise<any[]> {
    const userIdList = await this.entryRepository.find({
      select: ['user_id'],
      where: {
        room_id: room_id,
      },
    });

    return userIdList;
  }
}
