import { IsEmail, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateMonitorDto {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsInt()
    @Min(1)
    timeout: number;

    @IsEmail()
    alert_email: string;
}
