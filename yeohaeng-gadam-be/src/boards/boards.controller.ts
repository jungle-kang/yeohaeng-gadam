import { Controller, Get, Post, Body, Param, Delete, Patch, UsePipes, ValidationPipe, ParseIntPipe, UseGuards } from '@nestjs/common';
import { BoardStatus } from "./board-status.enum";
import { Board } from './board.entity';
import { BoardsService } from './boards.service';
import { createBoardDto } from './dto/create-board.dto';
import { BoardStatusValidationPipe } from './pipes/board-status-validation.pipe';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/auth/user.entity';
import {
    ApiBearerAuth, ApiBody,
    ApiOperation, ApiTags,
    ApiParam, ApiConsumes,
    /* The `// @UseGuards(AuthGuard())` line is a commented-out code in the `test` method of the
    `AuthController` class. */
    ApiCreatedResponse
} from '@nestjs/swagger';
import { GoogleAuthGuard } from 'src/auth/auth.guard';
import { GetUser } from 'src/auth/dto/get-user.decorator';


@ApiTags('Boards')//swagger에 tag를 생성해줌
@Controller('boards')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('access-token') //인증추가 
export class BoardsController {
    constructor(private boardsService: BoardsService) { }

    @ApiOperation({ summary: '모든 게시물 목록보기' }) // api 설명
    @Get()
    getAllBoard(
        @GetUser() user: User
    ): Promise<Board[]> {
        return this.boardsService.getAllBoards(user);
    }

    @Post()
    @ApiOperation({
        summary: '게시물 작성',
        description: '게시판 생성 API',
    })
    @ApiConsumes('application/x-www-form-urlencoded')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                title: {
                    type: 'string',
                    description: "제목"
                },
                description: {
                    type: 'string',
                    description: "내용"
                },
            },
        },
    })
    @ApiCreatedResponse({
        description: '성공여부',
        schema: {
            example: { success: true },
        },
    })

    @UsePipes(ValidationPipe)
    createBoard(@Body() createBoardDto: createBoardDto,
        @GetUser() user: User): Promise<Board> {
        return this.boardsService.createBoard(createBoardDto, user);
    }

    @ApiOperation({ summary: 'ID로 특정 게시물 읽기' })
    @Get('/:id')
    getBoardById(@Param('id') id: number): Promise<Board> {
        return this.boardsService.getBoardById(id);
    }

    // @Get('/:id')
    // getBoardById(@Param('id') id: string): Board {
    //     return this.boardsService.getBoardById(id)
    // }

    @Delete('/:id')
    @ApiOperation({ summary: 'ID로 특정 게시물 삭제하기' })
    @ApiParam({
        name: 'id',
        type: 'number',
    })
    deleteBoard(@Param('id', ParseIntPipe) id,
        @GetUser() user: User
    ): Promise<void> {
        return this.boardsService.deleteBoard(id, user);
    }
    // @Delete('/:id')
    // deleteBoard(@Param('id') id: string): void {
    //     this.boardsService.deleteBoard(id);
    // }



    @Patch('/:id/status')
    @ApiOperation({
        summary: 'ID로 특정 게시물의 상태 업데이트',
        description: 'default public -> private 로 변경가능 '
    })
    @ApiConsumes('application/x-www-form-urlencoded') // form 형식(postman 처럼)
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                status: {
                    type: 'string',
                    description: "private or public",
                    enum: ['private', 'public']
                },
            },
        },
    })
    updateBoardStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body('status', BoardStatusValidationPipe) status: BoardStatus
    ) {
        return this.boardsService.updateBoardStatus(id, status);
    }
}
