import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PlanService } from './plan.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('plans')
@Controller('plan')
export class PlanController {
  constructor(private readonly planService: PlanService) { }

  @Post('/:roomId')
  @ApiOperation({
    summary: 'day 생성',
    description: ' roomId에 해당하는 day 생성',
  })
  async createDay(@Param('roomId') roomId: string) {
    return await this.planService.createDay(roomId);
  }

  @Post('/:roomId/:day')
  @ApiOperation({
    summary: '계획 생성',
    description: ' roomId와 day에 해당하는 계획 생성',
  })
  async createPlan(
    @Param('roomId') roomId: string,
    @Param('day') day: number,
    @Body() createPlanDto: CreatePlanDto) {
    await this.planService.createDay(roomId);
    return await this.planService.createPlan(day, roomId, createPlanDto.plans);
  }

  @Get('/:roomId/:day')
  @ApiOperation({
    summary: 'roomId와 day에 해당하는 계획 조회',
    description: ' roomId와 day에 해당하는 계획 조회',
  })
  async getPlan(
    @Param('roomId') roomId: string,
    @Param('day') day: number,
  ) {
    return this.planService.getPlan(day, roomId);
  }

  @Get('/:roomId')
  @ApiOperation({
    summary: 'roomId에 해당하는 계획 조회',
    description: 'roomId에 해당하는 모든 계획을 조회합니다.',
  })
  async getPlansByRoomId(
    @Param('roomId') roomId: string,
  ) {
    return this.planService.getPlansByRoomId(roomId);
  }



  @Patch('/:roomId/:day')
  @ApiOperation({
    summary: '계획 수정',
    description: ' roomId와 day에 해당하는 계획 수정',
  })
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
