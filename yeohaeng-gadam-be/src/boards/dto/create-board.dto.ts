import { IsNotEmpty } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class createBoardDto {
    @ApiProperty({
        // example: 'swagger',
        description: '게시물 제목',
    })
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        // example: 'swagger',
        description: '게시물 내용',
    })
    @IsNotEmpty()
    description: string;

}
