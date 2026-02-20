import 'reflect-metadata';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MonitorStatus } from '../enums/monitor.status.enum';

@Schema({ timestamps: true })
export class Monitor extends Document {
    @Prop({ required: true, unique: true })
    id: string;

    @Prop({ required: true })
    timeout: number;

    @Prop({ required: true })
    alert_email: string;

    @Prop({ required: true, enum: MonitorStatus, default: MonitorStatus.ACTIVE })
    status: MonitorStatus;

    @Prop({ required: true, default: Date.now })
    last_heartbeat: Date;

    @Prop({ required: true })
    next_alert_at: Date;
}

export const MonitorSchema = SchemaFactory.createForClass(Monitor);
