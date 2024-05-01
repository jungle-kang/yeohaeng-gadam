import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomDTO } from './dto/room.dto';
import { Room } from './entities/room.entity';

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

//   @Post('/')
//   create(@Body() RoomDTO: RoomDTO) {
//     return this.roomService.create(RoomDTO);
//   }

//   @Get('/')
//   findAll() {
//     return this.roomService.findAll();
//   }

  @Get('/')
  async findAll(): Promise<Room[]> {
    const roomList = await this.roomService.findAll();
    return Object.assign({
      data: roomList,
      statusCode: 200,
      statusMsg: `데이터 조회가 성공적으로 완료되었습니다.`,
    });
  }

//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.roomService.findOne(+id);
//   }
//
//   @Patch(':id')
//   update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
//     return this.roomService.update(+id, updateRoomDto);
//   }
//
//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.roomService.remove(+id);
//   }
}
