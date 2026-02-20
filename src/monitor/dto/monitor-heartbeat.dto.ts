import { IsString, IsNotEmpty } from 'class-validator';

export class MonitorHeartBeatDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}
