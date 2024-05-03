import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { RoomService } from './room.service';
import { CreateRoomTagDto } from './dto/create-room-tag.dto';
import { SearchRoomDto } from './dto/search-room.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Room } from './entities/room.entity';


@ApiTags('room')
@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post('/')
  @ApiOperation({ summary: '방 생성', description: 'room 테이블에 데이터 저장 후 [\"tag1\", \"tag2\", \"tag3\"] ... 형식으로 전달받은 데이터를 tag 테이블에 room 테이블의 id와 tag의 개별 값을 매핑하여 저장' })
  async save(@Body() RoomTagDTO: CreateRoomTagDto) {
    const rsRoomTagDTO: CreateRoomTagDto = await this.roomService.save(RoomTagDTO);

    return {
      data: { rsRoomTagDTO },
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
  @ApiOperation({ summary: '태그를 그룹화하여 방 전체 조회', description: 'room 테이블과 tag 테이블을 room 테이블의 id를 기준으로 join 후 tag 테이블의 tag를 기준으로 group by하여 전체 조회' })
  async findRoomAndTags(): Promise<Room[]> {
    const roomTagsList = await this.roomService.findRoomAndTags();

    return Object.assign({
      data: roomTagsList,
      statusCode: HttpStatus.OK,
      statusMsg: `데이터 조회 성공`,
    });
  }

  @Get('/tag')
  @ApiOperation({ summary: '태그들을 포함하고 있는 방 조회', description: '[\"tag1\", \"tag2\", \"tag3\"] ... 형식으로 데이터 요청 시 tag1 또는 tag2 또는 tag3를 포함하고 있는 room_id 조회' })
  @ApiQuery({ name: 'tags', description: '["tag1", "tag2", "tag3"]<br>**태그는 최소 1개 이상이어야 합니다.**', required: true })
  async findRoomWithTags(@Query('tags') tags: string): Promise<Room[]> {
    // console.log('컨트롤러/tags >', tags);
    const roomIdList = await this.roomService.findRoomWithTags(tags);
    
    return Object.assign({
      data: roomIdList,
      statusCode: HttpStatus.OK,
      statusMsg: `데이터 조회 성공`,
    });
  }

  @Get('/date')
  @ApiOperation({ summary: '여행 시작 날짜부터 여행 종료 날짜 사이의 방 조회', description: 'room 테이블의 startDate, endDate 사이의 방 조회 후 tag 테이블과 join하여 전체 조회' })
  @ApiQuery({ name: 'startDate', description: '여행 시작 날짜', required: true })
  @ApiQuery({ name: 'endDate', description: '여행 종료 날짜', required: true })
  async findRoomByDate(@Query('startDate') startDate: string, @Query('endDate') endDate: string): Promise<any[]> {
    const roomTagsList = await this.roomService.findRoomByDate(startDate, endDate);
    
    return Object.assign({
        data: roomTagsList,
        statusCode: HttpStatus.OK,
        statusMsg: '데이터 조회 성공',
    });
}

  @Get('/')
  @ApiOperation({ summary: '방 쿼리 조회', description: 'room 테이블의 id, title, location, hcMax, startDate, endDate 중 속성을 선택하여 필요한 데이터 요청 시 방 조회' })
  async find(@Body() roomDTO: SearchRoomDto) {
    const data = await this.roomService.find(roomDTO);
    
    return {
      data,
      statusCode: HttpStatus.OK,
      statusMsg: '데이터 조회 성공',
    };
  }

  @Patch('/tag')
  @ApiOperation({ summary: '태그들 수정', description: '[\"tag1\", \"tag2\", \"tag3\"] ... 형식으로 전달받은 데이터를 tag 테이블에 room 테이블의 id와 tag의 개별 값을 매핑하여 저장' })
  @ApiQuery({ name: 'tags', description: '["tag1", "tag2", "tag3"]<br>**태그는 최소 1개 이상이어야 하며, 반드시 선택된 모든 태그 값을 전달해야 합니다.**', required: true })
  async changeTag(@Body() tagDTO: UpdateTagDto): Promise<Room[]> {
  // async changeTag(@Param('room_id') room_id: string, @Query('tags') tags: string): Promise<Room[]> {
    const tagList = await this.roomService.changeTag(tagDTO);
    
    return Object.assign({
      data: tagList,
      statusCode: HttpStatus.OK,
      statusMsg: `데이터 조회 성공`,
    });
  }

  @Delete('/:id')
  @ApiOperation({ summary: '방 삭제', description: 'room 테이블의 id로 방 삭제' })
  @ApiParam({ name: 'id', description: '방 기본키', required: true })
  async remove(@Param('id') id: string): Promise<void> {
    await this.roomService.remove(id);
    
    return Object.assign({
      data: { id },
      statusCode: HttpStatus.OK,
      statusMsg: `데이터 삭제 성공`,
    });
  }
  
}
