import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
// import { KakaoStrategy } from './kakao.strategy';
import { GoogleStrategy } from './google.strategies';
import { AuthController } from './auth.controller';
import { authService } from './auth.service';
import { User } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';


@Module({
    imports: [PassportModule, TypeOrmModule.forFeature([User])],
    providers: [authService, GoogleStrategy, JwtService, JwtStrategy],
    exports: [authService],
    controllers: [AuthController],
})
export class AuthModule { }
