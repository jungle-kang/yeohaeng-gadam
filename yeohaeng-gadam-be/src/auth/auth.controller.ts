import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthCredentialsDto } from './dto/auth-credential.dto';
import { AuthGuard } from '@nestjs/passport';
import { GoogleRequest } from './dto/auth.googleuser.dto';

@ApiTags('Auth-JWT')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }
  @Post('/signup')
  @ApiOperation({ summary: '회원가입' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: "유저 이름"
        },
        password: {
          type: 'string',
          description: "비밀번호  "
        },
      },
    },
  })
  signUp(@Body(ValidationPipe) authcredentialsDto: AuthCredentialsDto): Promise<void> {
    return this.authService.signUp(authcredentialsDto);
  }

  @Post('/signin')
  @ApiOperation({ summary: '로그인' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: "유저 이름"
        },
        password: {
          type: 'string',
          description: "비밀번호"
        },
      },
    },
  })
  signIn(@Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto) {
    return this.authService.signIn(authCredentialsDto);
  }

  @Post('/authTest')
  @UseGuards(AuthGuard())
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '유저정보 가져오기',
    description: 'Passport, Jwt 이용해서 토큰 인증 후 유저 정보 가져오기 '
  })
  authTest(@Req() req) {
    console.log(req);
  }

  /* google login */
  @Get('/google')
  @UseGuards(AuthGuard('google'))
  async googleLogin(@Req() req: Request) {
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleLoginCallback(@Req() req: GoogleRequest) {
    return this.authService.googleLogin(req)
  }

  // @Get('/protected')
  // @UseGuards(AuthGuard('jwt'))
  // protectedResource() {
  //   return 'JWT is working!';
  // }


}
