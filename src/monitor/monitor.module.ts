import { Module } from '@nestjs/common';
import { MonitorService } from './monitor.service';
import { MonitorController } from './monitor.controller';
import { EmailModule } from 'src/email/email.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Monitor, MonitorSchema } from './schemas/monitor.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Monitor.name, schema: MonitorSchema }]),
    EmailModule,
  ],
  controllers: [MonitorController],
  providers: [MonitorService],
})
export class MonitorModule { }
