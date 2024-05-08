import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { EntryService } from './entry.service';
import { CreateEntryDto } from './dto/create-entry.dto';
import { Entry } from 'src/entry/entities/entry.entity';

@ApiTags('entry')
@Controller('entry')
export class EntryController {
  constructor(private readonly entryService: EntryService) {}
  
  @Get('/all')
  @ApiOperation({ summary: '참가자 전체 조회', description: 'room 테이블 전체 조회' })
  async findAll(): Promise<Entry[]> {
    const entryList = await this.entryService.findAll();

    return Object.assign({
      data: entryList,
      statusCode: HttpStatus.OK,
      statusMsg: `데이터 조회 성공`
    });
  }

  @Get('/user')
  @ApiOperation({ summary: '사용자가 참가하고 있는 방 조회', description: 'user_id로 데이터 요청 시 사용자가 참여하고 있는 방 조회 후 tag 테이블과 join하여 전체 조회' })
  @ApiQuery({ name: 'user_id', required: true })
  async findRoomWithTagsByUser(@Query('user_id') user_id: string): Promise<Entry[]> {
    const roomTagsList = await this.entryService.findRoomWithTagsByUser(user_id);
    
    return Object.assign({
      data: roomTagsList,
      statusCode: HttpStatus.OK,
      statusMsg: `데이터 조회 성공`
    });
  }

  @Get('/room')
  @ApiOperation({ summary: '방에 참가하고 있는 사용자 전체 조회', description: 'room_id로 데이터 요청 시 방에 참가하고 있는 사용자 전체 조회' })
  @ApiQuery({ name: 'room_id', required: true })
  async findUserByRoom(@Query('room_id') room_id: string): Promise<Entry[]> {
    const userIdList = await this.entryService.findUserByRoom(room_id);
    
    return Object.assign({
      data: userIdList,
      statusCode: HttpStatus.OK,
      statusMsg: `데이터 조회 성공`
    });
  }

}
