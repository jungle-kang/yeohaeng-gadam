import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoomService } from './room.service';
import { CreateRoomTagDto } from './dto/create-room-tag.dto';
// import { CreateRoomDto } from './dto/create-room.dto';
// import { CreateTagDto } from './dto/create-tag.dto';
import { SearchRoomDto } from './dto/search-room.dto';
import { Room } from './entities/room.entity';

@ApiTags('room')
@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post('/')
  @ApiOperation({ summary: '방 생성', description: 'room 테이블에 데이터 저장 후 [\"tag1\", \"tag2\", \"tag3\"] ... 형식으로 전달받은 데이터를 tag 테이블에 room 테이블의 id와 tag의 개별 값을 매핑하여 저장' })
  async save(@Body() RoomTagDTO: CreateRoomTagDto) {
    await this.roomService.save(RoomTagDTO);

    return {
      data: { RoomTagDTO },
      statusCode: HttpStatus.CREATED,
      statusMsg: `데이터 저장 성공`,
    };
  }
  
  @Get('/all')
  @ApiOperation({ summary: '방 전체 조회', description: 'room 테이블 전체 조회' })
  async findAll(): Promise<Room[]> {
    const roomList = await this.roomService.findAll();

    return Object.assign({
      data: roomList,
      statusCode: HttpStatus.OK,
      statusMsg: `데이터 조회 성공`,
    });
  }

  @Get('/tags')
  @ApiOperation({ summary: '태그를 그룹화하여 방 전체 조회', description: 'room 테이블과 tag 테이블을 room 테이블의 id를 기준으로 join 후 tag 테이블의 tag를 기준으로 group by 하여 전체 조회' })
  async findRoomAndTags(): Promise<Room[]> {
    const roomList = await this.roomService.findRoomAndTags();

    return Object.assign({
      data: roomList,
      statusCode: HttpStatus.OK,
      statusMsg: `데이터 조회 성공`,
    });
  }

  @Get('/tag/:tags')
  @ApiOperation({ summary: '태그들을 포함하고 있는 방 조회', description: '[\"tag1\", \"tag2\", \"tag3\"] ... 형식으로 데이터 요청 시 tag1 또는 tag2 또는 tag3를 포함하고 있는 room_id 조회' })
  async findRoomAndTag(@Param('tags') tags: string): Promise<Room[]> {
    // console.log('컨트롤러/tags >', tags);
    const roomIdList = await this.roomService.findRoomWithTags(tags);
    
    return Object.assign({
      data: roomIdList,
      statusCode: HttpStatus.OK,
      statusMsg: `데이터 조회 성공`,
    });
  }

  @Get('/')
  @ApiOperation({ summary: '방 쿼리 조회', description: 'room 테이블의 id, title, location, hcMax, startDate, endDate로 방 조회' })
  async findOne(@Body() roomDTO: SearchRoomDto) {
    const data = await this.roomService.find(roomDTO);
    
    return {
      data,
      statusCode: HttpStatus.OK,
      statusMsg: '데이터 조회 성공',
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: '방 삭제', description: 'room 테이블의 id로 방 삭제' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.roomService.remove(id);
    
    return Object.assign({
      data: { id },
      statusCode: HttpStatus.OK,
      statusMsg: `데이터 삭제 성공`,
    });
  }
  
}
