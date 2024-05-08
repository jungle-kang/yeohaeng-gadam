import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as dotenv from 'dotenv';
import * as Joi from 'joi';
import { ChatModule } from './chat/chat.module';
import { AuthModule } from './auth/auth.module';
import { BoardsModule } from './boards/boards.module';
import { EntryModule } from './entry/entry.module';
import { RoomTagModule } from './room-tag/room-tag.module';
import { GoogleStrategy } from './auth/google.strategies';

dotenv.config();

@Module({
    imports: [
        // PassportModule.register({ defaultStrategy: 'jwt' }),
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
        AuthModule,
        BoardsModule,
        EntryModule,
        RoomTagModule,
    ],
    controllers: [AppController],
    providers: [AppService, GoogleStrategy],
})
export class AppModule { }
