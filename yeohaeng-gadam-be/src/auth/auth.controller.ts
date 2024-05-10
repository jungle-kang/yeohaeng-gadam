import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { authService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('oAuth')
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
    res.cookie('access_token', token.access_token, {});
    res.redirect(process.env.FRONTEND_URL);
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
