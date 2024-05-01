import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './google.strategy';

@Module({
  imports: [
    //유저를 인증하기위해 사용할 기본 strategy를 jwt로 설정
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'process.env.JWT_SECRET_KEY', // 토큰을 만들때 이용하는 Secret 텍스트(아무거나 넣어도 됨)
      signOptions: {
        expiresIn: 60 * 60, //(1시간)정해진 시간 이후에는 토큰이 유효하지 않게 된다.
      }
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],
  //JwtStrategy를 이 AuthModule에서 사용할 수 있도록 등록
  providers: [AuthService, JwtStrategy, GoogleStrategy],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule { }
