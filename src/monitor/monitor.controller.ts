import { Controller, Post, Body, Param, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { CreateMonitorDto } from './dto/create-monitor.dto';
import { MonitorService } from './monitor.service';
import { MonitorHeartBeatDto } from './dto/monitor-heartbeat.dto';
import { UpdateTimeoutDto } from './dto/update-timeout.dto';

@Controller('monitors')
export class MonitorController {
  constructor(private readonly monitorsService: MonitorService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createMonitorDto: CreateMonitorDto) {
    const monitor = await this.monitorsService.create(createMonitorDto);
    return {
      message: 'Monitor created successfully',
      data: {
        id: monitor.id,
        timeout: monitor.timeout,
        alert_email: monitor.alert_email,
        status: monitor.status,
      },
    };
  }

  @Post(':id/heartbeat')
  @HttpCode(HttpStatus.OK)
  async heartbeat(@Param() params: MonitorHeartBeatDto) {
    await this.monitorsService.heartbeat(params.id);
    return { message: 'Heartbeat received' };
  }

  @Post(':id/pause')
  @HttpCode(HttpStatus.OK)
  async pause(@Param() params: MonitorHeartBeatDto) {
    await this.monitorsService.pause(params.id);
    return { message: 'Monitor paused' };
  }

  @Patch(':id/update-timeout')
  @HttpCode(HttpStatus.OK)
  async updateTimeout(@Param() params: MonitorHeartBeatDto, @Body() createMonitorDto: UpdateTimeoutDto) {
    await this.monitorsService.updateTimeout(params.id, createMonitorDto.timeout);
    return { message: 'Monitor timeout updated' };
  }
}
