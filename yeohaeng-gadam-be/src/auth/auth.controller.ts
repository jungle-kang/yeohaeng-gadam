import { BadRequestException, Body, Controller, Get, Post, Req, Res, Response, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { authService } from './auth.service';
import { GoogleRequest } from './dto/auth.googleuser.dto';
import { GoogleAuthGuard } from './auth.guard';

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: authService) { }

    /* google login */
    @Get("google")
    @UseGuards(AuthGuard('google'))
    // @UseGuards(GoogleAuthGuard)
    async googleLogin(@Req() req) {
        console.log('GET google/login - googleAuth 실행');
    }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    // @UseGuards(GoogleAuthGuard)
    // async googleLoginCallback(@Req() req: GoogleRequest) {
    //     return this.authService.googleLogin(req)
    // }
    async googleAuthRedirect(@Req() req, @Res() res) {
        console.log('GET oauth2/redirect/google - googleAuthRedirect 실행');

        const token = await this.authService.googleLogin(req);
        res.cookie('access_token', token.access_token, { httpOnly: true });
        res.redirect('/');
    }
}
