import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  Response,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { authService } from './auth.service';
import { GoogleRequest } from './dto/auth.googleuser.dto';
import { GoogleAuthGuard } from './auth.guard';

const FRONTEND_URL = process.env.FRONTEND_URL;

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: authService) { }

  /* google login */
  @Get('google')
  @UseGuards(AuthGuard('google'))
  // @UseGuards(GoogleAuthGuard)
  async googleLogin(@Req() req) {
    console.log('GET google/login - googleAuth 실행');
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    console.log('GET oauth2/redirect/google - googleAuthRedirect 실행');
    const token = await this.authService.googleLogin(req);
    // res.cookie('access_token', token.access_token, 
    //   {
    //     // domain: "http://ec2-13-125-5-177.ap-northeast-2.compute.amazonaws.com:3000",
    //     // domain: "http://13.125.5.177:3000",
    //     // domain: "http://13.125.5.177:5173",
    //     // path: "/",
    //     // sameSite: "lax",
    //   }
    // );
    // res.redirect("http://ec2-13-125-5-177.ap-northeast-2.compute.amazonaws.com:3000");
    // res.redirect("http://13.125.5.177:3000");
    // res.redirect("http://13.125.5.177:5173");

    // res.redirect("새 페이지");

    return (token.access_token);
  }

  @Get('/me/:id')
  async me(@Param('id') id: string) {
    if (this.authService.idCheck(id)) {
      return Object.assign({
        data: true,
        statusCode: HttpStatus.OK,
        statusMsg: `데이터 조회 성공`,
      });
    } else {
      return Object.assign({
        data: false,
        statusCode: HttpStatus.OK,
        statusMsg: `데이터 조회 실패`,
      });
    }
  }
}
