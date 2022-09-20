import OtpService from "@modules/otp/otp.service";
import KafkaPlugin, { SMS_TOPIC } from "@plugins/kafka";
import RedisCache from "@plugins/redis";
import { IKafkaMessageHandler, IKafkaSmsTopic } from "@type/kafka";
import {
  EachBatchPayload,
  TopicPartitions
} from "kafkajs";
import SMSProvider from "./sms-provider.service";

const STOP_CONSUMER_PERIOD = 100;

export class KafkaConsumerService {
  static async eachBatchHandler(payload: EachBatchPayload) {
    const {
      batch,
      resolveOffset,
      heartbeat,
      // commitOffsetsIfNecessary,
      uncommittedOffsets,
      // isRunning,
      // isStale,
    } = payload;

    for (let m of batch.messages) {
      const message: IKafkaMessageHandler = {
        topic: batch.topic,
        partition: batch.partition,
        highWatermark: batch.highWatermark,
        offset: m.offset,
        key: m?.key?.toString() as string,
        value: m?.value?.toString() as string,
        headers: m.headers,
        resolveOffset: resolveOffset
      };

      try {
        await KafkaConsumerService.eachMessageHandler(message);

        await heartbeat();
      } catch (error) {
        console.log('something went wrong with message-handler', error);
      }
    }
  }

  static async eachMessageHandler(message: IKafkaMessageHandler) {
    if (KafkaPlugin.getLimiter().getTokensRemaining() >= 1) {
      await KafkaPlugin.getLimiter().removeTokens(1);
      
      // define message handle according to topic:
      if (message.topic == SMS_TOPIC) {
        KafkaConsumerService.smsProviderSendMessage(message);
      }

      // ========================================
    } else {
      const topicPartition: TopicPartitions = { topic: SMS_TOPIC, partitions: [message.partition] };
      
      KafkaConsumerService.pauseConsumer(topicPartition);
    }
  }

  static async pauseConsumer(topicPartition: TopicPartitions) {
    if (!KafkaConsumerService.isTopicPaused(topicPartition)) {
      KafkaPlugin.getConsumer().pause([topicPartition]);

      KafkaConsumerService.resumeConsumer(topicPartition);
    }
  };

  static async resumeConsumer(topicPartition: TopicPartitions) {
    setTimeout(() => {      
      if (KafkaPlugin.getLimiter().getTokensRemaining() >= 1 && KafkaConsumerService.isTopicPaused(topicPartition)) {
        KafkaPlugin.getConsumer().resume([topicPartition]);

      } else if (KafkaConsumerService.isTopicPaused(topicPartition)) {
        KafkaConsumerService.resumeConsumer(topicPartition);

      }
    }, STOP_CONSUMER_PERIOD);
  };

  static isTopicPaused(topicPartition: TopicPartitions) {
    const pausedConsumerJson = KafkaPlugin.getConsumer().paused().map(c => JSON.stringify(c));
    return pausedConsumerJson.includes(JSON.stringify(topicPartition));
  }

  static async smsProviderSendMessage(message: IKafkaMessageHandler) {
    const payload: IKafkaSmsTopic = JSON.parse(message.value);
  
    const { otpLength, messageId, ...payloadSms } = payload;

    try {
      message.resolveOffset(message.offset);

      const { data } = await SMSProvider.sendSMS(payloadSms);

      console.info(`[SUCCESSED] - SEND OTP to ${payload.phoneNumber} - ${payload.code} successfully!!!`);
  
      const persistData = {
          ...payload,
          otpLength,
          messageId,
          idOmniMess: data.metadata?.idOmniMess
      };
  
      await RedisCache.set(messageId, persistData, payload.timeToLiveInSecond, payload.phoneNumber);
      await OtpService.saveCacheAfterSent(data, messageId);
    } catch (error) {
      console.log(`[FAILED] - SEND OTP TO ${payload.phoneNumber}`, error);
    }
  }
}