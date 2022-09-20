import { RateLimiter } from "limiter";
import { Plugin } from "@vcsc/node-core";
import {
  Kafka,
  Producer,
  Consumer,
} from "kafkajs";
import { KafkaConsumerService } from "@services/kafka-consumer.service";


let kafka: Kafka;
let producer: Producer;
let consumer: Consumer;
let limiter: RateLimiter;

const CLIENT_ID = "sms-provider-service";
const KAFKA_BROKERS = process.env.KAFKA_BROKERS?.split(',') || ["localhost:9092"];
const GROUP_ID = "sms-handlers-group";
export const SMS_TOPIC = process.env.SMS_TOPIC || "sms-handers-topic.sms-provider-qc";
const SMS_LIMIT = Number(process.env.SMS_LIMIT);
const ONE_INTERVAL_PERIOD = 1 * 1000;

export default class KafkaPlugin extends Plugin {
  async install(): Promise<void> {
    limiter = new RateLimiter({ tokensPerInterval: SMS_LIMIT, interval: ONE_INTERVAL_PERIOD })

    kafka = new Kafka({
      clientId: CLIENT_ID,
      brokers: KAFKA_BROKERS
    });

    // init producer:
    producer = kafka.producer();
    await producer.connect();

    // init consumer:
    consumer = kafka.consumer({ groupId: GROUP_ID });
    await consumer.connect();

    // Kill instance if exceed retry connecting broker
    const { STOP } = consumer.events

    consumer.on(STOP, e => {
        console.error('Consumer stopped')

        console.error(e)

        process.exit(1)

    })
    //

    await consumer.subscribe({ topic: SMS_TOPIC, fromBeginning: true });
    await consumer.run({
      eachBatchAutoResolve: false,
      eachBatch: KafkaConsumerService.eachBatchHandler,
    });
  }

  static getLimiter(): RateLimiter {
    return limiter;
  }

  static getConsumer(): Consumer {
    return consumer;
  }

  static getProducer(): Producer {
    return producer;
  }
};