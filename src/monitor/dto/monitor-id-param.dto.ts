import { IsString, IsNotEmpty } from 'class-validator';

export class MonitorIdParamDto {
    @IsString()
    @IsNotEmpty()
    id: string;
}
