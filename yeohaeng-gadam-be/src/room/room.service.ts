import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomDTO } from './dto/room.dto';
// import { UpdateRoomDto } from './dto/update-room.dto';
import { Room } from './entities/room.entity';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room) private roomRepository: Repository<Room>,
  ) {}

//   create(createRoomDto: CreateRoomDto) {
//     return 'This action adds a new room';
//   }

  findAll(): Promise<Room[]>{
    return this.roomRepository.find();
  }

//   findOne(id: number) {
//     return `This action returns a #${id} room`;
//   }
//
//   update(id: number, updateRoomDto: UpdateRoomDto) {
//     return `This action updates a #${id} room`;
//   }
//
//   remove(id: number) {
//     return `This action removes a #${id} room`;
//   }
}
