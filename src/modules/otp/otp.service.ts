import { SMS_TOPIC } from "@plugins/kafka";
import RedisCache from "@plugins/redis";
import { KafkaProducerService } from "@services/kafka-producer.service";
import SMSProvider from "@services/sms-provider.service";
import { IKafkaSmsTopic } from "@type/kafka";
import { CheckVendorReq, ConfirmOtpReq, GenerateOtpReq } from "@type/otp-service-type";
import { IRedisSavedSms } from "@type/redis";
import { ISendSMSResponse } from "@type/sms-provider";
import { HttpError } from "@vcsc/node-core";
import { INVALID_MESSAGE_ID, OTP_EXPIRED_OR_NOT_EXISTED, VENDER_NOT_FOUND } from "src/constants/error-msgs";
import { v4 as uuid } from "uuid";

export default class OtpService {
    static async generateOtp(data: GenerateOtpReq): Promise<any> {
        const { phoneNumber, otpLength, content, timeToLive, routeRule } = data;

        const messageId = uuid();

        const code = SMSProvider.generateCode(otpLength);

        const payload: IKafkaSmsTopic = {
            content,
            timeToLiveInSecond: timeToLive,
            phoneNumber,
            code,
            routeRule,
            otpLength,
            messageId,
        };

        KafkaProducerService.sendMessages(
            [{ key: messageId, value: JSON.stringify(payload) }],
            SMS_TOPIC
        )

        return messageId;
    }

    static async resendOtp(data: GenerateOtpReq): Promise<any> {
        const { phoneNumber, messageId } = data;

        await RedisCache.delete(messageId as string, phoneNumber);

        return OtpService.generateOtp(data);
    }

    static async confirmOtp(data: ConfirmOtpReq): Promise<any> {
        const otp: IRedisSavedSms = await RedisCache.get(data.messageId, data.phoneNumber);

        if (!otp || otp.code != data.code) throw new HttpError(404, OTP_EXPIRED_OR_NOT_EXISTED);

        await RedisCache.delete(data.messageId, data.phoneNumber);

        return true;
    }

    static async checkVendorProvider(data: CheckVendorReq): Promise<any> {
        const { messageId } = data;
        const redisData = await RedisCache.get(`KEY_${messageId}`);

        if (!redisData) {
            throw new HttpError(404, INVALID_MESSAGE_ID);
        }

        if (redisData?.idOmniMess) {
            return await SMSProvider.getVendorProvider(redisData?.idOmniMess);
        };
    }

    static async saveCacheAfterSent(data: ISendSMSResponse, messageId: string) {
        // after OTP is confirm, redis will remove key-value 
        // so we use this record to track the data!
        if (data.idOmniMess && messageId) {
            await RedisCache.set(`KEY_${messageId}`, data, 300);
        }
    }
}