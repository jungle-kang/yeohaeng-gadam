import { BadRequestException, Body, Controller, Get, Post, Req, Response, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { authService } from './auth.service';
import { GoogleRequest } from './dto/auth.googleuser.dto';

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: authService) { }

    /* google login */
    @Get("google")
    @UseGuards(AuthGuard('google'))
    async googleLogin(@Req() req: Request) { }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    googleLoginCallback(@Req() req: GoogleRequest) {
        return this.authService.googleLogin(req)
    }

}