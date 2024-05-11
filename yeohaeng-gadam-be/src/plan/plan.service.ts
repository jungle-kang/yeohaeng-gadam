import { Injectable } from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Plan } from './entities/plan.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(Plan)
    private planRepository: Repository<Plan>,
  ) { }
  async createDay(roomId: string) {
    // 1. 마지막 날짜 찾기
    const lastDay = await this.planRepository
      .createQueryBuilder("plan")
      .where("plan.room_id = :roomId", { roomId })
      .orderBy("plan.day", "DESC")
      .getOne();

    // 2. day + 1 추가
    const newDayNumber = lastDay ? lastDay.day + 1 : 1;
    const newDay = this.planRepository.create({
      day: newDayNumber,
      room_id: { id: roomId },
      plans: '',
    });

    // 3. db에 저장
    return this.planRepository.save(newDay);
  }

  async createPlan(day: number, roomId: string, plans: string) {
    // 1. 해당 날짜와 방 번호에 대한 계획 중 plans가 비어 있는 행이 있는지 확인
    const emptyPlan = await this.planRepository
      .createQueryBuilder("plan")
      .where("plan.room_id = :roomId AND plan.day = :day AND plan.plans = ''", { roomId, day })
      .getOne();

    // 2. plans 필드가 비어 있는 행이 있다면 새로운 계획을 추가
    if (emptyPlan) {
      emptyPlan.plans = plans;
      await this.planRepository.save(emptyPlan); // 변경 사항 저장
      return emptyPlan;
      // } else { 
      //   // 해당 조건을 만족하는 행이 없다면 새로운 행을 생성 - 새로운 행 생성하지 않고 그자리에서 업데이트 해도 될듯
      //   // const newPlan = this.planRepository.create({
      //   //   day: day,
      //   //   room_id: { id: roomId },
      //   //   plans: plans,
      //   // });
      //   emptyPlan.plans = plans;
      //   await this.planRepository.save(emptyPlan);
      //   return emptyPlan;
      // }
    }
  }

  async getPlan(day: number, roomId: string) {
    const plan = await this.planRepository
      .createQueryBuilder("plan")
      .where("plan.room_id = :roomId AND plan.day = :day", { roomId, day })
      .getMany();

    return plan;
  }

  async getPlansByRoomId(roomId: string) {
    const plans = await this.planRepository
      .createQueryBuilder("plan")
      .where("plan.room_id = :roomId", { roomId })
      .getMany();

    return plans;
  }



  async updatePlan(day: number, roomId: string, plans: string) {
    // 1. 해당 날짜와 방 번호에 대한 계획을 찾음
    const existingPlan = await this.planRepository
      .createQueryBuilder("plan")
      .where("plan.room_id = :roomId AND plan.day = :day", { roomId, day })
      .getOne();

    // 2. 찾은 계획에 대해 plans 필드 업데이트
    if (existingPlan) {
      existingPlan.plans = plans;
      await this.planRepository.save(existingPlan); // 변경 사항 저장
      return existingPlan;
    } else {
      throw new Error("계획을 찾을 수 없습니다.");
    }
  }
}


