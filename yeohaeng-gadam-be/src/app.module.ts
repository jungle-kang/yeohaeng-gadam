import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoomModule } from './room/room.module';
import { AuthModule } from './auth/auth.module';

import * as Joi from 'joi';
import { ChatModule } from './chat/chat.module';
import { GoogleStrategy } from './auth/google.strategies';


dotenv.config();

@Module({
    imports: [
        ChatModule,
        ConfigModule.forRoot({
            validationSchema: Joi.object({
                FRONTEND_URL: Joi.string().required(),
            }),
            isGlobal: true,
        }),
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: process.env.DATABASE_HOST,
            port: Number(process.env.DATABASE_PORT),
            username: process.env.DATABASE_USERNAME,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
            entities: [
                __dirname + '/**/*.entity{.ts,.js}'
            ],
            synchronize: true,
        }),
        RoomModule,
        AuthModule,
    ],
    controllers: [AppController],
    providers: [AppService, GoogleStrategy],
})
export class AppModule { }
