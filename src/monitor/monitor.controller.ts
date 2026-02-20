import { Controller, Post, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { CreateMonitorDto } from './dto/create-monitor.dto';
import { MonitorIdParamDto } from './dto/monitor-id-param.dto';
import { MonitorService } from './monitor.service';

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
  async heartbeat(@Param() params: MonitorIdParamDto) {
    await this.monitorsService.heartbeat(params.id);
    return { message: 'Heartbeat received' };
  }

  @Post(':id/pause')
  @HttpCode(HttpStatus.OK)
  async pause(@Param() params: MonitorIdParamDto) {
    await this.monitorsService.pause(params.id);
    return { message: 'Monitor paused' };
  }
}
