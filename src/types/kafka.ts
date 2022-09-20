import { ISendSMS } from "./sms-provider";

export interface IKafkaMessage {
  key: string;
  value: string;
}

export interface IKafkaMessageHandler {
  topic: string;
  partition: number;
  highWatermark: string;
  offset: string;
  key: string;
  value: string;
  headers: any;
  resolveOffset: any
}

export interface IKafkaSmsTopic extends ISendSMS {
  otpLength: number;
  messageId: string;
}

export interface IKafkaMessageFlag {
  time: number;
  isExecuting: boolean;
}