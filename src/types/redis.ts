import { IKafkaSmsTopic } from "./kafka";

export interface IRedisSavedSms extends IKafkaSmsTopic {
  idOmniMess: string;
}