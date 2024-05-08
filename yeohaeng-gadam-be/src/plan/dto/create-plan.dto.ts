import { Type } from "class-transformer";
import { IsNotEmpty } from "class-validator";

export class CreatePlanDto {

    @IsNotEmpty()

    plans: string;
}
