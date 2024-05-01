import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { Room } from './entities/room.entity';

@ApiTags('room')
@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post('/')
  @ApiOperation({
        summary: '방 생성',
        description: '방 생성 API'
    })
  async save(@Body() roomDTO: CreateRoomDto) {
    await this.roomService.save(roomDTO);
    return {
      data: { roomDTO },
      statusCode: HttpStatus.CREATED,
      statusMsg: `데이터 저장 성공`,
    };
  }
  
  @Get('/all')
  async findAll(): Promise<Room[]> {
    const roomList = await this.roomService.findAll();
    return Object.assign({
      data: roomList,
      statusCode: HttpStatus.OK,
      statusMsg: `데이터 조회 성공`,
    });
  }
  
  @Get('/')
  async findOne(
    @Query('id') id: number,
    @Query('title') title: string,
    @Query('location') location: string,
    @Query('hcMax') hcMax?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<{ data: Room[] | undefined; statusCode: HttpStatus; statusMsg: string; }> {
    const queryParameters = {
      id,
      title,
      location,
      ...(hcMax !== undefined && { hcMax }),  // hcMax가 존재할 경우에만 포함
      ...(startDate !== undefined && { startDate }),
      ...(endDate !== undefined && { endDate }),
    };
    const data = await this.roomService.find(queryParameters);
    return {
      data,
      statusCode: HttpStatus.OK,
      statusMsg: '데이터 조회 성공',
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    await this.roomService.remove(id);
    return Object.assign({
      data: { id },
      statusCode: HttpStatus.NO_CONTENT,
      statusMsg: `데이터 삭제 성공`,
    });
  }
  
}
