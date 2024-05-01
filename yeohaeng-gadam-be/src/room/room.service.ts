import { Injectable, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoomDto } from './dto/create-room.dto';
// import { UpdateRoomDto } from './dto/update-room.dto';
import { Room } from './entities/room.entity';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room) private roomRepository: Repository<Room>,
  ) {}

  async save(RoomDTO: CreateRoomDto): Promise<Room> {
    const saveRoom = this.roomRepository.create(RoomDTO);  // DTO를 Entity로 변환
    return await this.roomRepository.save(saveRoom);  // Entity 저장 후 반환
  }

  async findAll(): Promise<Room[]>{
    return await this.roomRepository.find();
  }

  async find(params: { id: number; title: string; location: string, hcMax: number, startDate: string, endDate: string}): Promise<Room[] | undefined> {
    const { id, title, location, hcMax, startDate, endDate } = params;
  
    // 검색 조건 변수
    const where: any = {};
  
    // 변수에 조건 추가
    if (id !== undefined) {
      where.id = id;
    }
    if (title !== undefined) {
      where.title = title;
    }
    if (location !== undefined) {
      where.location = location;
    }
    if (hcMax !== undefined) {
      where.hcMax = hcMax;
    }
    if (startDate !== undefined) {
      where.startDate = startDate;
    }
    if (endDate !== undefined) {
      where.endDate = endDate;
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

  async remove(id: number): Promise<void> {
    await this.roomRepository.delete({ id });
  }
  
}
