import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThan, MoreThanOrEqual, Repository } from 'typeorm';
import { CreateEntryDto } from '../entry/dto/create-entry.dto';
import { CreateRoomTagDto } from './dto/create-room-tag.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { CreateTagDto } from './dto/create-tag.dto';
import { SearchRoomTagsDto } from './dto/search-room-tags.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Room } from './entities/room.entity';
import { Tag } from './entities/tag.entity';
import { Entry } from '../entry/entities/entry.entity';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room) private roomRepository: Repository<Room>,
    @InjectRepository(Tag) private tagRepository: Repository<Tag>,
    @InjectRepository(Entry) private entryRepository: Repository<Entry>
  ) { }

  async save(roomTagDTO: CreateRoomTagDto): Promise<CreateRoomTagDto> {
    const roomDTO: CreateRoomDto = {
      title: roomTagDTO.title,
      location: roomTagDTO.location,
      state: 0,
      hc_attend: 0,
      hc_max: roomTagDTO.hc_max,
      hd_id: roomTagDTO.hd_id,
      start_date: roomTagDTO.start_date,
      end_date: roomTagDTO.end_date
    };

    const saveRoom = this.roomRepository.create(roomDTO);  // DTO를 Entity로 변환
    const savedRoomDTO: CreateRoomDto = await this.roomRepository.save(saveRoom);  // Entity 저장 후 반환

    if (roomTagDTO.tags !== null && roomTagDTO.tags !== undefined) {
      const addTagArray: string[] = roomTagDTO.tags;

      for (let i = 0; i < addTagArray.length; i++) {
        const tagDTO: CreateTagDto = {
          room_id: savedRoomDTO.id,
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
      hc_attend: roomTagDTO.hc_attend,
      hc_max: roomTagDTO.hc_max,
      hd_id: roomTagDTO.hd_id,
      start_date: roomTagDTO.start_date,
      end_date: roomTagDTO.end_date,
      tags: roomTagDTO.tags
    };

    return rsRoomTagDTO;
  }

  async findAll(): Promise<Room[]> {
    return await this.roomRepository.find();
  }

  async findRoomWithTags(): Promise<any[]> {
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
      GROUP BY 
        room.id;
    `);
  }

  // ["tag1", "tag2"] tag1과 tag2 중 하나라도 포함하고 있는 room 테이블의 id를 배열로 반환
  async findRoomWithOrTags(orTagArray: string[]): Promise<any[]> {
    // const orTagArray = JSON.parse(tags);
    // console.log('room-tag.service > findRoomWithOrTags > orTagArray :', orTagArray);

    let orConditions = '';
    for (let i = 1; i < orTagArray.length; i++) {
      orConditions += `OR tag.tag = '${orTagArray[i]}' `;
    }

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
        room.id IN (
            SELECT DISTINCT
              room_id
            FROM
              yeohaeng_gadam.tag
            WHERE
              tag.tag = '${orTagArray[0]}' ${orConditions}
        )
      GROUP BY 
        room.id;
    `);
  }

  // ["tag1", "tag2"] tag1과 tag2를 모두 포함하고 있는 room 테이블의 id를 배열로 반환
  async findRoomIdWithOrTags(tags: string): Promise<any[]> {
    const orTagArray = JSON.parse(tags);

    // console.log('room-tag.service > findRoomIdWithOrTags > orTagArray :', orTagArray);

    const roomIdList: string[] = (await this.roomRepository.query(`
        SELECT DISTINCT
          room_id AS id
        FROM
          yeohaeng_gadam.tag
        WHERE
          tag IN (${orTagArray.map(tag => `'${tag}'`).join(', ')});
    `)).map((item: any) => item.id);

    return roomIdList;
  }

  async findRoomByDate(start_date?: string, end_date?: string): Promise<any[]> {
    if (end_date === undefined) {
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
          room.id IN (
            SELECT
              id 
            FROM
              room
            WHERE
              start_date >= '${start_date}'
          )
        GROUP BY 
          room.id
        ORDER BY 
          room.start_date ASC, room.state ASC, room.hc_attend ASC, room.hc_max ASC;
      `);
    } else if (start_date === undefined) {
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
            room.id IN (
              SELECT
                id 
              FROM
                room
              WHERE
                end_date <= '${end_date}'
            )
          GROUP BY 
            room.id
          ORDER BY 
            room.start_date ASC, room.state ASC, room.hc_attend ASC, room.hc_max ASC;
        `);
    } else {
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
          room.id IN (
            SELECT
              id 
            FROM
              room
            WHERE
              start_date BETWEEN '${start_date}' AND '${end_date}'
            AND
              end_date BETWEEN '${start_date}' AND '${end_date}'
          )
        GROUP BY 
          room.id
        ORDER BY 
          room.start_date ASC, room.state ASC, room.hc_attend ASC, room.hc_max ASC;
      `);
    }
  }

  async findRoomWithTagsAndConditions(roomTagsDTO: SearchRoomTagsDto): Promise<any[]> {
    if (roomTagsDTO.id !== undefined) {  // roomTagsDTO.id가 있으면
      return await this.roomRepository.createQueryBuilder('room')
        .leftJoinAndSelect('room.tags', 'tag')
        .where({ id: roomTagsDTO.id })
        .select([
          'room.id AS room_id',
          'room.title AS title',
          'room.location AS location',
          'room.state AS state',
          'room.hc_attend AS hc_attend',
          'room.hc_max AS hc_max',
          'room.hd_id AS hd_id',
          'DATE_FORMAT(room.start_date, \'%Y-%m-%d\') AS start_date',
          'DATE_FORMAT(room.end_date, \'%Y-%m-%d\') AS end_date',
          'JSON_ARRAYAGG(tag.tag) AS tags'
        ])
        .groupBy('room.id')
        .orderBy({
          'room.start_date': 'ASC',
          'room.state': 'ASC',
          'room.hc_attend': 'ASC',
          'room.hc_max': 'ASC'
        })
        .getRawMany();
    } else {  // roomTagsDTO.id가 없으면
      // 검색 조건 변수
      let where: any = {};

      // 변수에 조건 추가
      if (roomTagsDTO.title !== undefined) {
        where.title = roomTagsDTO.title;
      }
      if (roomTagsDTO.location !== undefined) {
        where.location = roomTagsDTO.location;
      }
      if (roomTagsDTO.state !== undefined) {
        where.state = roomTagsDTO.state;
      }
      if (roomTagsDTO.hc_attend !== undefined) {
        where.hc_attend = roomTagsDTO.hc_attend;
      }
      if (roomTagsDTO.hc_max !== undefined) {
        where.hc_max = roomTagsDTO.hc_max;
      }
      if (roomTagsDTO.hd_id !== undefined) {
        where.hd_id = roomTagsDTO.hd_id;
      }
      if (roomTagsDTO.start_date !== undefined && roomTagsDTO.end_date === undefined) {  // start_date 이후 모든 날짜
        where.start_date = MoreThanOrEqual(roomTagsDTO.start_date);
      } else if (roomTagsDTO.end_date !== undefined && roomTagsDTO.start_date === undefined) {  // end_date 이전 모든 날짜
        where.end_date = LessThan(roomTagsDTO.end_date);
      } else if (roomTagsDTO.start_date !== undefined && roomTagsDTO.end_date !== undefined) {  // start_date와 end_date 사이 모든 날짜
        where.start_date = Between(roomTagsDTO.start_date, roomTagsDTO.end_date);
        where.end_date = Between(roomTagsDTO.start_date, roomTagsDTO.end_date);
      }

      if (roomTagsDTO.tags === undefined || JSON.parse(roomTagsDTO.tags).length === 0) {  // roomTagsDTO.id와 roomTagsDTO.tags가 없으면
        return await this.roomRepository.createQueryBuilder('room')
          .leftJoinAndSelect('room.tags', 'tag')
          .where(where)
          .select([
            'room.id AS room_id',
            'room.title AS title',
            'room.location AS location',
            'room.state AS state',
            'room.hc_attend AS hc_attend',
            'room.hc_max AS hc_max',
            'room.hd_id AS hd_id',
            'DATE_FORMAT(room.start_date, \'%Y-%m-%d\') AS start_date',
            'DATE_FORMAT(room.end_date, \'%Y-%m-%d\') AS end_date',
            'JSON_ARRAYAGG(tag.tag) AS tags'
          ])
          .groupBy('room.id')
          .orderBy({
            'room.start_date': 'ASC',
            'room.state': 'ASC',
            'room.hc_attend': 'ASC',
            'room.hc_max': 'ASC'
          })
          .getRawMany();
      } else {  // roomTagsDTO.tags가 있으면
        // console.log('room-tag.service > findRoomWithTagsAndConditions > JSON.parse(roomTagsDTO.tags).length :', JSON.parse(roomTagsDTO.tags).length);

        const roomIdList = await this.findRoomIdWithOrTags(roomTagsDTO.tags);

        // console.log('room-tag.service > findRoomWithTagsAndConditions > roomIdList :', roomIdList);

        if (roomIdList.length > 0) {
          return await this.roomRepository.createQueryBuilder('room')
            .leftJoinAndSelect('room.tags', 'tag')
            .where(`room.id IN (${roomIdList})`)
            .andWhere(where)
            .select([
              'room.id AS room_id',
              'room.title AS title',
              'room.location AS location',
              'room.state AS state',
              'room.hc_attend AS hc_attend',
              'room.hc_max AS hc_max',
              'room.hd_id AS hd_id',
              'DATE_FORMAT(room.start_date, \'%Y-%m-%d\') AS start_date',
              'DATE_FORMAT(room.end_date, \'%Y-%m-%d\') AS end_date',
              'JSON_ARRAYAGG(tag.tag) AS tags'
            ])
            .groupBy('room.id')
            .orderBy({
              'room.start_date': 'ASC',
              'room.state': 'ASC',
              'room.hc_attend': 'ASC',
              'room.hc_max': 'ASC'
            })
            .getRawMany();
        }
      }
    }
  }

  async changeState(roomDTO: UpdateRoomDto): Promise<any> {
    const rsRoomState = await this.roomRepository.query(`
      UPDATE
        room
      SET
        state = ${roomDTO.state}
      WHERE
        id = ${roomDTO.id};
    `);

    return rsRoomState;
  }

  async changeRoomEnter(room_id: string, user_id: string): Promise<any> {
    const rsRoomEnter = await this.roomRepository.query(`
      SELECT 
        hc_max, 
        room.id AS room_id, 
        IF(hc_attend < hc_max, 'true', 'false') AS room_enter,
        JSON_ARRAYAGG(entry.user_id) AS users,
        JSON_ARRAYAGG(entry.color) AS colors
      FROM 
        yeohaeng_gadam.room
      LEFT JOIN 
        yeohaeng_gadam.entry ON room.id = entry.room_id
      WHERE
        room.id = ${room_id};
    `);

    // 최대 인원으로 색상표 생성
    const allColorArray: number[] = [];
    for (let i = 0; i < rsRoomEnter[0].hc_max; i++) {
      allColorArray.push(i);
    }

    // console.log('room-tag.service > allColorArray :', allColorArray)

    // 색상표 배열과 존재하는 색상의 차집합을 계산해 추가할 수 있는 색상들 저장
    const addColorArray: number[] = allColorArray.filter(color => !(rsRoomEnter[0].colors).includes(color));

    addColorArray.sort()

    // console.log('room-tag.service > addColorArray :', addColorArray[0]);

    const existUserArray: string[] = rsRoomEnter[0].users

    // 참가 인원이 최대 인원보다 작고
    // 사용자가 참가하지 않은 방이라면
    if (rsRoomEnter[0].room_enter === 'true' && !existUserArray.includes(user_id)) {
      // 참가 인원 수 증가
      await this.roomRepository.update(room_id, {
        hc_attend: () => 'hc_attend + 1',
      });

      // console.log('room-tag.service > changeRoomEnter : 참가 완료');

      const entryDTO: CreateEntryDto = {
        room_id: room_id,
        user_id: user_id,
        color: addColorArray[0]
      }
      const saveEntry = this.entryRepository.create(entryDTO);
      const savedEntry = await this.entryRepository.save(saveEntry);

      // console.log('room-tag.service > changeRoomEnter > savedEntry :', savedEntry);

      return true;
    } else if (existUserArray.includes(user_id)) {  // 사용자가 이미 참가한 방이라면
      // console.log('room-tag.service > changeRoomEnter : 이미 참가');

      return true;
    } else {
      // console.log('room-tag.service > changeRoomEnter : 참가 불가');

      return false;
    }
  }

  async changeRoomExit(room_id: string, user_id: string): Promise<any> {
    // 참가 인원이 1명 이하로 남았으면 거짓
    const rsRoomExit = await this.roomRepository.query(`
      SELECT 
        room.id AS room_id,
        IF(hc_attend > 1, 'true', 'false') AS room_exit,
        room.hd_id,
        JSON_ARRAYAGG(entry.user_id) AS users
      FROM 
        yeohaeng_gadam.room
      LEFT JOIN 
        yeohaeng_gadam.entry ON room.id = entry.room_id
      WHERE
        room.id = ${room_id};
    `);

    const existUserArray: string[] = rsRoomExit[0].users

    const hd_id = rsRoomExit[0].hd_id;

    // 참가 인원이 1명보다 많고
    // 사용자가 참가한 방이라면
    if (rsRoomExit[0].room_exit === 'true' && existUserArray.includes(user_id)) {
      if (hd_id === user_id) {  // 방장이 나가면 방장 위임
        await this.roomRepository.update(room_id, {
          hd_id: existUserArray[1]
        });
      }

      // 참가 인원 수 감소
      await this.roomRepository.update(room_id, {
        hc_attend: () => 'hc_attend - 1',
      });

      await this.entryRepository.delete({ room_id: room_id, user_id: user_id });

      return true;
    } else if (existUserArray.includes(user_id)) {  // 참가 인원이 1명 남았으면 방 삭제
      // room 테이블의 id를 외래키로 가지고 있는 행을 삭제
      await this.entryRepository.delete({ room_id: room_id });
      await this.tagRepository.delete({ room_id: room_id });

      // 방 삭제
      await this.roomRepository.delete({ id: room_id });

      return true;
    } else {
      return false;
    }
  }

  async changeTag(tagDTO: UpdateTagDto): Promise<any> {
    // console.log('room-tag.service > changeTag > tagDTO.tags :', tagDTO.tags);

    const changeTagArray: string[] = tagDTO.tags;

    // console.log('room-tag.service > changeTag > changeTagArray :', changeTagArray);

    if (changeTagArray.length === 0) {  // 모든 태그 제거
      await this.tagRepository.delete({ room_id: tagDTO.room_id });
    } else {  // 태그 변경
      // 존재했던 태그들
      const existTagArray: string[] = (await this.roomRepository.query(`
        SELECT
          JSON_ARRAYAGG(tag) AS tags FROM tag
        WHERE
          room_id = '${tagDTO.room_id}'
        GROUP BY
          room_id;
      `)).map((item: any) => item.tags).flat();  // 검색한 값 평탄화

      // console.log('room-tag.service > changeTag > existTagArray :', existTagArray);

      // 존재했던 태그와 변경할 태그 배열의 차집합을 계산해 선택 취소할 태그들 저장
      const removeTagArray: string[] = existTagArray.filter(tag => !changeTagArray.includes(tag));
      let orConditions = '';
      for (let i = 1; i < removeTagArray.length; i++) {
        orConditions += `OR tag = '${removeTagArray[i]}' `;
      }

      // console.log('room-tag.service > changeTag > removeTagArray :', removeTagArray);

      // 변경할 태그와 존재했던 태그 배열의 차집합을 계산해 신규 선택할 태그들 저장
      const addTagArray: string[] = changeTagArray.filter(tag => !existTagArray.includes(tag));
      let values = '';
      for (let i = 0; i < addTagArray.length; i++) {
        if (i !== ((addTagArray.length) - 1)) {
          values += `(${tagDTO.room_id}, '${addTagArray[i]}'),`;
        } else {
          values += `(${tagDTO.room_id}, '${addTagArray[i]}')`;
        }
      }

      // console.log('room-tag.service > changeTag > addTagArray :', addTagArray);

      // 존재했던 태그들 중에서 선택 취소된 태그들 삭제
      await this.roomRepository.query(`
        DELETE
          FROM tag
        WHERE
          room_id = '${tagDTO.room_id}'
        AND
          (tag = '${removeTagArray[0]}' ${orConditions});`);

      // 존재했던 태그들 중에서 신규 선택된 태그들 저장
      await this.roomRepository.query(`
        INSERT INTO
          tag (room_id, tag)
        VALUES
          ${values};
      `);
    }

    return {
      room_id: tagDTO.room_id,
      tags: changeTagArray
    };
  }

  async remove(id: string): Promise<void> {
    await this.roomRepository.delete({ id: id });
  }

}
function createArrayWithInt(hc_max: any) {
  throw new Error('Function not implemented.');
}

