import { Injectable, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoomTagDto } from './dto/create-room-tag.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { CreateTagDto } from './dto/create-tag.dto';
// import { UpdateRoomDto } from './dto/update-room.dto';
import { SearchRoomDto } from './dto/search-room.dto';
import { Room } from './entities/room.entity';
import { Tag } from './entities/tag.entity';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room) private roomRepository: Repository<Room>,
    @InjectRepository(Tag) private tagRepository: Repository<Tag>,
  ) {}

  async save(RoomTagDTO: CreateRoomTagDto): Promise<void> {
    const RoomDTO: CreateRoomDto = {
      title: RoomTagDTO.title,
      location: RoomTagDTO.location,
      hcMax: RoomTagDTO.hcMax,
      startDate: RoomTagDTO.startDate,
      endDate: RoomTagDTO.endDate
    };

    const saveRoom = this.roomRepository.create(RoomDTO);  // DTO를 Entity로 변환

    const savedRoom: CreateRoomDto = await this.roomRepository.save(saveRoom);  // Entity 저장 후 반환
    
    const TagDTO: CreateTagDto = {
      roomId: savedRoom.id,
      tag: RoomTagDTO.tag
    };

    const saveTag = this.tagRepository.create(TagDTO);

    await this.tagRepository.save(saveTag);
  }

  async findAll(): Promise<Room[]>{
    return await this.roomRepository.find();
  }

  async findRoomAndTags(): Promise<any[]> {
    return await this.roomRepository.query(`
      SELECT 
          room.id AS room_id, 
          room.title, 
          room.location, 
          room.hc_max, 
          room.start_date, 
          room.end_date, 
          CONCAT('[', GROUP_CONCAT(tag.tag separator ', '), ']') AS tags
      FROM 
          yeohaeng_gadam.room
      LEFT JOIN 
          yeohaeng_gadam.tag ON room.id = tag.room_id
      GROUP BY 
          room.id, room.title, room.location, room.hc_max, room.start_date, room.end_date
    `);
  }

  async findRoomWithTags(tags: string): Promise<any[]> {
    // ['tag 4', 'tag3']
    const cleanedTagString = tags.replace(/\[|\]/g, '');  // 양 끝의 대괄호 제거
    // console.log('서비스/cleanedTagString >', cleanedTagString);
    const tagArray = cleanedTagString.split(',');  // ,를 기준으로 잘라서 배열에 저장
    // console.log('서비스/tagArray >', tagArray);
    // console.log('서비스/tagArray[0] >', tagArray[0]);

    let orConditions = '';
    for (let i = 1; i < tagArray.length; i++) {
        orConditions += `OR tag.tag =${tagArray[i]} `;
    }

    // console.log('서비스/OR conditions:', orConditions);
    // console.log('서비스/', tagArray[0], orConditions);

    return await this.roomRepository.query(`
      SELECT DISTINCT
        room.id AS room_id
      FROM 
        yeohaeng_gadam.room
      INNER JOIN 
        yeohaeng_gadam.tag ON room.id = tag.room_id
      WHERE 
        tag.tag = ${tagArray[0]} ${orConditions};
    `);
  }

  async find(RoomDTO: SearchRoomDto): Promise<Room[]> {
    // 검색 조건 변수
    const where: any = {};
  
    // 변수에 조건 추가
    if (RoomDTO.id !== undefined) {
      where.id = RoomDTO.id;
    }
    if (RoomDTO.title !== undefined) {
      where.title = RoomDTO.title;
    }
    if (RoomDTO.location !== undefined) {
      where.location = RoomDTO.location;
    }
    if (RoomDTO.hcMax !== undefined) {
      where.hcMax = RoomDTO.hcMax;
    }
    if (RoomDTO.startDate !== undefined) {
      where.startDate = RoomDTO.startDate;
    }
    if (RoomDTO.endDate !== undefined) {
      where.endDate = RoomDTO.endDate;
    }
  
    return await this.roomRepository.find({ where });
  }

//   findOne(id: number) {
//     return `This action returns a #${id} room`;
//   }
//
//   update(id: number, updateRoomDto: UpdateRoomDto) {
//     return `This action updates a #${id} room`;
//   }

  async remove(id: string): Promise<void> {
    await this.roomRepository.delete({ id });
  }
  
}
