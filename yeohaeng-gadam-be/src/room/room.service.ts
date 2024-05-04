import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoomTagDto } from './dto/create-room-tag.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { CreateTagDto } from './dto/create-tag.dto';
import { SearchRoomDto } from './dto/search-room.dto';
// import { UpdateRoomDto } from './dto/update-room.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Room } from './entities/room.entity';
import { Tag } from './entities/tag.entity';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room) private roomRepository: Repository<Room>,
    @InjectRepository(Tag) private tagRepository: Repository<Tag>,
  ) {}

  async save(roomTagDTO: CreateRoomTagDto): Promise<CreateRoomTagDto> {
    const roomDTO: CreateRoomDto = {
      title: roomTagDTO.title,
      location: roomTagDTO.location,
      state: 0,
      hcAttend: 0,
      hcMax: roomTagDTO.hcMax,
      startDate: roomTagDTO.startDate,
      endDate: roomTagDTO.endDate
    };

    const saveRoom = this.roomRepository.create(roomDTO);  // DTO를 Entity로 변환
    const savedRoomDTO: CreateRoomDto = await this.roomRepository.save(saveRoom);  // Entity 저장 후 반환
    
    // console.log('서비스/RoomTagDTO.tag >', RoomTagDTO.tags);

    if (roomTagDTO.tags !== null && roomTagDTO.tags !== undefined) {
      const addTagArray: string[] = roomTagDTO.tags;

      for (let i = 0; i < addTagArray.length; i++) {
        const tagDTO: CreateTagDto = {
          roomId: savedRoomDTO.id,
          tag: addTagArray[i]
        };
    
        const saveTag = this.tagRepository.create(tagDTO);
    
        await this.tagRepository.save(saveTag);
      }
    }

    const rsRoomTagDTO: CreateRoomTagDto = {
      id: savedRoomDTO.id,
      title: roomTagDTO.title,
      location: roomTagDTO.location,
      state: roomTagDTO.state,
      hcAttend: roomTagDTO.hcAttend,
      hcMax: roomTagDTO.hcMax,
      startDate: roomTagDTO.startDate,
      endDate: roomTagDTO.endDate,
      tags: roomTagDTO.tags
    };
    
    return rsRoomTagDTO;
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
          room.state, 
          room.hc_attend,
          room.hc_max, 
          room.start_date, 
          room.end_date, 
          JSON_ARRAYAGG(tag.tag) AS tags
      FROM 
          yeohaeng_gadam.room
      LEFT JOIN 
          yeohaeng_gadam.tag ON room.id = tag.room_id
      GROUP BY 
          room.id, room.title, room.location, room.state, room.hc_attend, room.hc_max, room.start_date, room.end_date;
    `);
  }

  async findRoomWithTags(tags: string): Promise<any[]> {
    // ["tag1", "tag2"]
    const addTagArray = JSON.parse(tags);
    console.log('서비스/addTagArray >', addTagArray);
    // console.log('서비스/addTagArray[0] >', addTagArray[0]);

    let orConditions = '';
    for (let i = 1; i < addTagArray.length; i++) {
      orConditions += `OR tag.tag = '${addTagArray[i]}' `;
    }

    // console.log('서비스/OR conditions:', orConditions);

    return await this.roomRepository.query(`
      SELECT DISTINCT
          room.id AS room_id
      FROM 
          yeohaeng_gadam.room
      INNER JOIN 
          yeohaeng_gadam.tag ON room.id = tag.room_id
      WHERE 
          tag.tag = '${addTagArray[0]}' ${orConditions};
    `);
  }

  async findRoomByDate(startDate: string, endDate: string): Promise<any[]> {
    return await this.roomRepository.query(`
      SELECT
          room.id AS room_id, 
          room.title, 
          room.location, 
          room.state, 
          room.hc_attend,
          room.hc_max, 
          room.start_date, 
          room.end_date, 
          JSON_ARRAYAGG(tag.tag) AS tags
      FROM 
            yeohaeng_gadam.room
      LEFT JOIN 
            yeohaeng_gadam.tag ON room.id = tag.room_id
      WHERE 
          room.id IN (
              SELECT id 
              FROM room
              WHERE start_date BETWEEN '${startDate}' AND '${endDate}'
              AND end_dateBETWEEN '${startDate}' AND '${endDate}'
          )
      GROUP BY 
          room.id, room.title, room.location, room.state, room.hc_attend, room.hc_max, room.start_date, room.end_date
      ORDER BY 
          room.start_date ASC, room.state ASC, room.hc_attend ASC, room.hc_max ASC;
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
    if (RoomDTO.state !== undefined) {
      where.state = RoomDTO.state;
    }
    if (RoomDTO.hcAttend !== undefined) {
      where.hcAttend = RoomDTO.hcAttend;
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

  async findRoomEnter(id: string): Promise<any> {
    // 참가 인원이 최대 인원보다 작으면 참
    const rsRoomEnter = await this.roomRepository.query(`
      SELECT IF(hc_attend < hc_max, 'true', 'false') AS room_enter
      FROM room
      WHERE id = ${id};
    `);

    if(rsRoomEnter[0].room_enter === 'true') {
      // 참가 인원 수 증가
      await this.roomRepository.update(id, {
        hcAttend: () => 'hc_attend + 1',
      });

      return true;
    } else {
      return false;
    }
  }

  async findRoomExit(id: string): Promise<any> {
    // 참가 인원이 1명만 남았으면 거짓
    const rsRoomExit = await this.roomRepository.query(`
      SELECT IF(hc_attend != 1, 'true', 'false') AS room_exit
      FROM room
      WHERE id = ${id};
    `);

    if(rsRoomExit[0].room_exit === 'true') {
      // 참가 인원 수 감소
      await this.roomRepository.update(id, {
        hcAttend: () => 'hc_attend - 1',
      });

      return true;
    } else {
      // 참가 인원이 1명 남았으면 방 삭제
      this.remove(id);

      return false;
    }
  }

  async changeTag(tagDTO: UpdateTagDto): Promise<any> {
    // 검색한 값 평탄화
    const existTagArray: string[] = (await this.roomRepository.query(`
      SELECT JSON_ARRAYAGG(tag) AS tags FROM tag
      WHERE room_id = '${tagDTO.roomId}'
      GROUP BY room_id;
    `)).map((item: any) => item.tags).flat();
    console.log('서비스/existTagArray >', existTagArray);
    console.log('서비스/tagDTO.tags >', tagDTO.tags);
    
    const changeTagArray: string[] = tagDTO.tags;
    console.log('서비스/changeTagArray >', changeTagArray);

    // 존재했던 태그와 변경할 태그 배열의 차집합을 계산해 선택 취소할 태그들 저장
    const removeTagArray: string[] = existTagArray.filter(tag => !changeTagArray.includes(tag));
    let orConditions = '';
    for (let i = 1; i < removeTagArray.length; i++) {
      orConditions += `OR tag = '${removeTagArray[i]}' `;
    }
    
    // console.log('서비스/removeTagArray >', removeTagArray);

    // 변경할 태그와 존재했던 태그 배열의 차집합을 계산해 신규 선택할 태그들 저장
    const addTagArray: string[] = changeTagArray.filter(tag => !existTagArray.includes(tag));
    let values = '';
    for (let i = 0; i < addTagArray.length; i++) {
      if(i !== ((addTagArray.length)-1)){
        values += `(${tagDTO.roomId}, '${addTagArray[i]}'),`;
      } else {
        values += `(${tagDTO.roomId}, '${addTagArray[i]}')`;
      }
    }

    // console.log('서비스/addTagArray >', addTagArray);

    // 존재했던 태그들 중에서 선택 취소된 태그들 삭제
    await this.roomRepository.query(`
      DELETE FROM tag
      WHERE room_id = '${tagDTO.roomId}'
      AND (tag = '${removeTagArray[0]}' ${orConditions});`);

    // 존재했던 태그들 중에서 신규 선택된 태그들 저장
    await this.roomRepository.query(`
      INSERT INTO tag (room_id, tag)
      VALUES ${values};
    `);

    return {
      roomId: tagDTO.roomId,
      tags: changeTagArray
    };
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
