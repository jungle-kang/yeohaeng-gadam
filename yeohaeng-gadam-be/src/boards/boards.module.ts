import { Module } from '@nestjs/common';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from './board.entity'
import { AuthModule } from 'src/auth/auth.module';
// import { BoardRepository } from './board.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Board]),//엔티티 등록
    AuthModule
  ],
  controllers: [BoardsController],
  providers: [BoardsService]
})
export class BoardsModule { }
