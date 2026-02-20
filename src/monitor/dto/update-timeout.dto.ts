import { IsInt, Min } from 'class-validator';

export class UpdateTimeoutDto {

  @IsInt()
  @Min(1)
  timeout: number;

}
