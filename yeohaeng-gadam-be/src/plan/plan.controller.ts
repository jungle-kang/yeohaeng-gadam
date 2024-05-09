import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PlanService } from './plan.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';


@Controller('plan')
export class PlanController {
  constructor(private readonly planService: PlanService) { }

  @Post('/:roomId')
  async createDay(@Param('roomId') roomId: string) {
    return await this.planService.createDay(roomId);
  }

  @Post('/:roomId/:day')
  async createPlan(
    @Param('roomId') roomId: string,
    @Param('day') day: number,
    @Body() createPlanDto: CreatePlanDto) {
    return this.planService.createPlan(day, roomId, createPlanDto.plans);
  }

  @Get('/:roomId/:day')
  async getPlan(
    @Param('roomId') roomId: string,
    @Param('day') day: number,
  ) {
    return this.planService.getPlan(day, roomId);
  }



  @Patch('/:roomId/:day')
  async updatePlan(
    @Param('roomId') roomId: string,
    @Param('day') day: number,
    @Body() updatePlanDto: { plans: string }
  ) {
    return this.planService.updatePlan(day, roomId, updatePlanDto.plans);
  }


  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.planService.remove(+id);
  // }
}
