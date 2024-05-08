import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PlanService } from './plan.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';


@Controller('plan')
export class PlanController {
  constructor(private readonly planService: PlanService) { }

  @Post('/createDay/:roomId')
  async createDay(@Param('roomId') roomId: string) {
    return await this.planService.createDay(roomId);
  }

  @Post('/createPlan/:roomId/:day')
  async createPlan(
    @Param('roomId') roomId: string,
    @Param('day') day: number,
    @Body() createPlanDto: CreatePlanDto) {
    return this.planService.createPlan(day, roomId, createPlanDto.plans);
  }

  // @Get('/:day/:roomId')
  // async findbyDate() {
  //   return this.planService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.planService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
  //   return this.planService.update(+id, updatePlanDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.planService.remove(+id);
  // }
}
