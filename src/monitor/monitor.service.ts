import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Monitor } from './schemas/monitor.schema';
import { CreateMonitorDto } from './dto/create-monitor.dto';
import { MonitorStatus } from './enums/monitor.status.enum';
import { EmailService } from '../email/email.service';

@Injectable()
export class MonitorService {
  private readonly logger = new Logger(MonitorService.name);

  constructor(
    @InjectModel(Monitor.name) private monitorModel: Model<Monitor>,
    private readonly emailService: EmailService,
  ) { }

  async create(createMonitorDto: CreateMonitorDto): Promise<Monitor> {
    const monitor = await this.monitorModel.findOne({ id: createMonitorDto.id }).exec();
    if (monitor) {
      throw new ConflictException(`Monitor with id ${createMonitorDto.id} already exists`);
    }
    const nextAlertAt = new Date();
    nextAlertAt.setSeconds(nextAlertAt.getSeconds() + createMonitorDto.timeout);

    const createdMonitor = new this.monitorModel({
      ...createMonitorDto,
      status: MonitorStatus.ACTIVE,
      last_heartbeat: new Date(),
      next_alert_at: nextAlertAt,
    });

    this.logger.log(`New monitor registered: ${createMonitorDto.id}`);
    return createdMonitor.save();
  }

  async heartbeat(id: string): Promise<Monitor> {
    const monitor = await this.monitorModel.findOne({ id }).exec();
    if (!monitor) {
      throw new NotFoundException(`Monitor with id ${id} not found`);
    }

    // Trigger recovery notification if device was down
    if (monitor.status === MonitorStatus.DOWN) {
      this.logger.log(`RECOVERY: Device ${id} is back online!`);
      await this.emailService.sendRecovery(monitor.alert_email, id);
    }

    // Reset the alert window
    const nextAlertAt = new Date();
    nextAlertAt.setSeconds(nextAlertAt.getSeconds() + monitor.timeout);

    monitor.status = MonitorStatus.ACTIVE;
    monitor.last_heartbeat = new Date();
    monitor.next_alert_at = nextAlertAt;

    return monitor.save();
  }

  async updateTimeout(id: string, timeout: number): Promise<Monitor> {
    const monitor = await this.monitorModel.findOne({ id }).exec();
    if (!monitor) {
      throw new NotFoundException(`Monitor with id ${id} not found`);
    }

    // Reset the alert window
    const nextAlertAt = new Date();
    nextAlertAt.setSeconds(nextAlertAt.getSeconds() + timeout);

    monitor.timeout = timeout;
    monitor.next_alert_at = nextAlertAt;

    return monitor.save();
  }

  async pause(id: string): Promise<Monitor> {
    const monitor = await this.monitorModel.findOne({ id }).exec();
    if (!monitor) {
      throw new NotFoundException(`Monitor with id ${id} not found`);
    }

    monitor.status = MonitorStatus.PAUSED;
    this.logger.log(`Monitoring paused for device: ${id}`);
    return monitor.save();
  }

  @Cron(CronExpression.EVERY_SECOND)
  async checkMonitors() {
    const now = new Date();
    const expiredMonitors = await this.monitorModel
      .find({
        status: MonitorStatus.ACTIVE,
        next_alert_at: { $lte: now },
      })
      .exec();

    for (const monitor of expiredMonitors) {
      monitor.status = MonitorStatus.DOWN;
      await monitor.save();

      this.logger.log(
        JSON.stringify({
          ALERT: `Device ${monitor.id} is down!`,
          time: new Date().toISOString(),
        }),
      );

      await this.emailService.sendAlert(monitor.alert_email, monitor.id);
    }
  }
}
