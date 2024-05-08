import { Module } from '@nestjs/common';
import { PlanService } from './plan.service';
import { PlanController } from './plan.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan } from './entities/plan.entity';
import { Room } from 'src/room-tag/entities/room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Plan, Room])],
  controllers: [PlanController],
  providers: [PlanService],
})
export class PlanModule { }
