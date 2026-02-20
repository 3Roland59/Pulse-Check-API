import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly mailerService: MailerService) { }

  async sendAlert(to: string, deviceId: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject: `ALERT: Device ${deviceId} is Down`,
        template: './templates/alert',
        context: {
          deviceId,
          time: new Date().toISOString(),
        },
      });
      this.logger.log(`Email alert sent to ${to} for device ${deviceId}`);
    } catch (error) {
      this.logger.error(`Failed to send email alert to ${to}: ${error.message}`);
    }
  }

  async sendRecovery(to: string, deviceId: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject: `RECOVERY: Device ${deviceId} is Back Online`,
        template: './templates/recovery',
        context: {
          deviceId,
          time: new Date().toISOString(),
        },
      });
      this.logger.log(`Email recovery notification sent to ${to} for device ${deviceId}`);
    } catch (error) {
      this.logger.error(`Failed to send email recovery notification to ${to}: ${error.message}`);
    }
  }
}
