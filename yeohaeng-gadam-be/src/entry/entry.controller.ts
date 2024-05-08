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
  @ApiOperation({ summary: '사용자가 참여하고 있는 방 조회', description: 'user_id로 데이터 요청 시 사용자가 참여하고 있는 room_id 조회' })
  @ApiQuery({ name: 'user_id', required: true })
  async findRoomWithUser(@Query('user_id') user_id: string): Promise<Entry[]> {
    const roomIdList = await this.entryService.findRoomWithUser(user_id);
    
    return Object.assign({
      data: roomIdList,
      statusCode: HttpStatus.OK,
      statusMsg: `데이터 조회 성공`
    });
  }

}
