import { IsString, Matches, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class AuthCredentialsDto {
    @ApiProperty({
        // example: 'swagger',
        description: '유저이름',
    })
    @IsString()
    @MinLength(4)
    @MaxLength(20)
    username: string;


    @ApiProperty({
        // example: 'swagger',
        description: '비밀번호',
    })
    @IsString()
    @MinLength(4)
    @MaxLength(20)
    //영어랑 숫자만 가능한 유효성 체크
    @Matches(/^[a-zA-Z0-9]*$/, {
        message: 'password only accepts english and number'
    })
    password: string;


}