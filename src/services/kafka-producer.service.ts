import KafkaPlugin from "@plugins/kafka";
import { IKafkaMessage } from "@type/kafka";

export class KafkaProducerService {
  static async sendMessages(messages: Array<IKafkaMessage>, topic: string) {
    return await KafkaPlugin.getProducer().send({ messages, topic });
  }
}