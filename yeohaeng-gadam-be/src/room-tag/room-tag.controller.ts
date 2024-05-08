import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { RoomService } from './room-tag.service';
import { CreateRoomTagDto } from './dto/create-room-tag.dto';
import { SearchRoomTagsDto } from './dto/search-room-tags.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Room } from './entities/room.entity';

@ApiTags('room')
@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post('/')
  @ApiOperation({ summary: '방 생성', description: 'room 테이블에 데이터 저장 후 [\"tag1\", \"tag2\", \"tag3\"] ... 형식으로 전달받은 데이터를 tag 테이블에 room 테이블의 id와 tag의 개별 값을 매핑하여 저장' })
  async save(@Body() roomTagDTO: CreateRoomTagDto) {
    const rsRoomTagDTO: CreateRoomTagDto = await this.roomService.save(roomTagDTO);

    return {
      data: rsRoomTagDTO,
      statusCode: HttpStatus.CREATED,
      statusMsg: `데이터 저장 성공`
    };
  }
  
  @Get('/all')
  @ApiOperation({ summary: '방 전체 조회', description: 'room 테이블 전체 조회' })
  async findAll(): Promise<Room[]> {
    const roomList = await this.roomService.findAll();

    return Object.assign({
      data: roomList,
      statusCode: HttpStatus.OK,
      statusMsg: `데이터 조회 성공`
    });
  }

  @Get('/tags')
  @ApiOperation({ summary: '태그를 그룹화하여 방 전체 조회', description: 'room 테이블과 tag 테이블을 room 테이블의 id를 기준으로 join 후 tag 테이블의 room_id를 기준으로 group by하여 tag들을 전체 조회' })
  async findRoomWithTags(): Promise<Room[]> {
    const roomTagsList = await this.roomService.findRoomWithTags();

    return Object.assign({
      data: roomTagsList,
      statusCode: HttpStatus.OK,
      statusMsg: `데이터 조회 성공`
    });
  }

  @Get('/tag')
  @ApiOperation({ summary: '태그들 중 하나라도 포함하고 있는 방 조회', description: '[\"tag1\", \"tag2\", \"tag3\"] ... 형식으로 데이터 요청 시 tag1 또는 tag2 또는 tag3를 포함하고 있는 room_id 조회' })
  @ApiQuery({ name: 'tags', description: '["tag1", "tag2", "tag3"]<br>**태그는 최소 1개 이상이어야 합니다.**', required: true })
  async findRoomWithOrTags(@Query('tags') tags: string): Promise<Room[]> {
    // console.log('컨트롤러/tags >', tags);
    const roomIdList = await this.roomService.findRoomWithOrTags(tags);
    
    return Object.assign({
      data: roomIdList,
      statusCode: HttpStatus.OK,
      statusMsg: `데이터 조회 성공`
    });
  }

  @Get('/date')
  @ApiOperation({ summary: '여행 시작 날짜부터 여행 종료 날짜 사이의 방 조회', description: 'room 테이블의 start_date, end_date 사이의 방 조회 후 tag 테이블과 join하여 전체 조회' })
  @ApiQuery({ name: 'start_date', description: '여행 시작 날짜', required: true })
  @ApiQuery({ name: 'end_date', description: '여행 종료 날짜', required: true })
  async findRoomByDate(@Query('start_date') start_date: string, @Query('end_date') end_date: string): Promise<any[]> {
    const roomTagsList = await this.roomService.findRoomByDate(start_date, end_date);
    
    return Object.assign({
        data: roomTagsList,
        statusCode: HttpStatus.OK,
        statusMsg: '데이터 조회 성공'
    });
  }

  @Get('/')
  @ApiOperation({ summary: '방 쿼리 조회', description: 'room 테이블의 id, title, location, hc_attend, hc_max, start_date, end_date, tags 중 속성을 선택하여 필요한 데이터 요청 시 모든 조건을 만족하는 방 조회' })
  @ApiQuery({ name: 'id', required: false })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'location', required: false })
  @ApiQuery({ name: 'state', required: false })
  @ApiQuery({ name: 'hc_attend', required: false })
  @ApiQuery({ name: 'hc_max', required: false })
  @ApiQuery({ name: 'start_date', description: '**end_date와 함께 기입해 주셔야 합니다.**', required: false })
  @ApiQuery({ name: 'end_date', description: '**start_date와 함께 기입해 주셔야 합니다.**', required: false })
  @ApiQuery({ name: 'tags', description: '["tag1", "tag2", "tag3"]<br>**태그는 최소 1개 이상이어야 합니다.**', required: false })
  async find(
    @Query('id') id?: string,
    @Query('title') title?: string,
    @Query('location') location?: string,
    @Query('state') state?: number,
    @Query('hc_attend') hc_attend?: number,
    @Query('hc_max') hc_max?: number,
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
    @Query('tags') tags?: string
  ) {
    const roomTagsDTO: SearchRoomTagsDto = {
      "id": id,
      "title": title,
      "location": location,
      "state": state,
      "hc_attend": hc_attend,
      "hc_max": hc_max,
      "start_date": start_date,
      "end_date": end_date,
      "tags": tags
    };
    const roomTagsList = await this.roomService.findRoomWithTagsAndConditions(roomTagsDTO);
    
    return {
      data: roomTagsList,
      statusCode: HttpStatus.OK,
      statusMsg: '데이터 조회 성공'
    };
  }

  @Patch('/state')
  @ApiOperation({ summary: '사용자 방 상태 수정'})
  @ApiBody({ type: UpdateRoomDto, description: 'id, state만 전달하시면 됩니다.' })
  async changeState(@Body() roomDTO: UpdateRoomDto): Promise<Room[]> {
  // async changeState(@Query('id') id?: string, @Query('state') state?: string): Promise<Room[]> {
    const rsRoomState = await this.roomService.changeState(roomDTO);

    return Object.assign({
      data: rsRoomState,
      statusCode: HttpStatus.OK,
      statusMsg: `데이터 수정 성공`
    });
  }

  @Patch('/enter')
  @ApiOperation({ summary: '사용자 방 참가 가능 여부 조회 후 가능 시 참가', description: 'room 테이블에서 참가 인원 수와 최대 인원 수를 비교하여 참가 가능 여부 조회 후 참가 아니면 불참<br><br>"data": true -> 참가 성공<br>"data": false -> 참가 불가' })
  async changeRoomEnter(@Query('room_id') room_id?: string, @Query('user_id') user_id?: string): Promise<Room[]> {
    const rsRoomEnter = await this.roomService.changeRoomEnter(room_id, user_id);

    return Object.assign({
      data: rsRoomEnter,
      statusCode: HttpStatus.OK,
      statusMsg: rsRoomEnter ? `방 참가 성공` : `방 참가 실패`
    });
  }

  @Patch('/exit')
  @ApiOperation({ summary: '사용자 방 나가기 가능 여부 조회 후 가능 시 나가기', description: 'room 테이블에서 참가 인원 수와 최대 인원 수를 비교하여 나가기 가능 여부 조회 후 나가기 아니면 방 삭제<br><br>"data": true -> 나가기 성공<br>"data": false -> 나가기 성공 및 방 삭제' })
  async changeRoomExit(@Query('room_id') room_id?: string, @Query('user_id') user_id?: string): Promise<Room[]> {
    const rsRoomExit = await this.roomService.changeRoomExit(room_id, user_id);

    return Object.assign({
      data: rsRoomExit,
      statusCode: HttpStatus.OK,
      statusMsg: rsRoomExit ? `방 나가기 성공` : `방 나가기 실패`
    });
  }

  @Patch('/tag')
  @ApiOperation({ summary: '태그들 수정', description: '[\"tag1\", \"tag2\", \"tag3\"] ... 형식으로 전달받은 데이터를 tag 테이블에 room 테이블의 id와 tag의 개별 값을 매핑하여 저장' })
  @ApiBody({ type: UpdateTagDto, description: '<br>**태그는 최소 1개 이상이어야 하며, 반드시 선택된 모든 태그 값을 전달해야 합니다.**' })
  // @ApiQuery({ name: 'tags', description: '["tag1", "tag2", "tag3"]', required: true })
  async changeTag(@Body() tagDTO: UpdateTagDto): Promise<Room[]> {
  // async changeTag(@Param('room_id') room_id: string, @Query('tags') tags: string): Promise<Room[]> {
    const tagList = await this.roomService.changeTag(tagDTO);
    
    return Object.assign({
      data: tagList,
      statusCode: HttpStatus.OK,
      statusMsg: `데이터 수정 성공`
    });
  }

  @Delete('/:id')
  @ApiOperation({ summary: '방 삭제', description: 'room 테이블의 id로 방 삭제' })
  @ApiParam({ name: 'id', description: '방 기본키', required: true })
  async remove(@Param('id') id: string): Promise<void> {
    await this.roomService.remove(id);
    
    return Object.assign({
      data: id,
      statusCode: HttpStatus.OK,
      statusMsg: `데이터 삭제 성공`
    });
  }
  
}
