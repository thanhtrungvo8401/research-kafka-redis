import { ISendSMS, SmsProviderVendor } from "@type/sms-provider";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { SMS_PATTERN } from "src/constants/sms-patterns";

const {
  SMS_PROVIDER_URL = "http://10.11.0.7:9191",
  SMS_PROVIDER_API_CHECK_CHANNEL_PATH = "/incom/checkChannel",
  SMS_PROVIDER_API_KEY = "gc28gdGFjIGRldmVsb3BlciIsInZjc2MiOiJWM",
  SMS_PROVIDER_TIMEOUT = 60000,
  NODE_ENV,
  SMS_PROVIDER_API_PATH = "/incom/sendMessage",
  SMS_TEMPLATE_CODE = "default",
  SMS_ZNS_ROUTE_RULE = ["1", "3"],
  SMS_PROVIDER_VENDOR = SmsProviderVendor.ZNS,
} = process.env;
export default class SMSProvider {
  static isVendorZNS = SMS_PROVIDER_VENDOR === SmsProviderVendor.ZNS;
  static instance = SMSProvider.createApiInstance();

  static generateCode(otpLength: number): string {
    const digits = "0123456789";
    let OTP = "";

    for (let i = 0; i < otpLength; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }

    return OTP;
  }

  static getSMSPayload(data: ISendSMS) {
    const { phoneNumber, content, code, timeToLiveInSecond, routeRule } = data;

    if (SMSProvider.isVendorZNS) {
      return {
        phonenumber: phoneNumber,
        routerule: routeRule || SMS_ZNS_ROUTE_RULE,
        templatecode: SMS_TEMPLATE_CODE,
        list_param: {
          otp: code,
        },
      };
    }

    const minutes: string = Math.ceil(timeToLiveInSecond / 60).toString();

    let message;
    message = content.replace(SMS_PATTERN.OTP_CODE, code);
    message = message.replace(SMS_PATTERN.EXPIRE_TIME, minutes);

    return {
      Mobile: phoneNumber,
      Message: message,
    };
  }

  static createApiInstance(): AxiosInstance {
    const config: AxiosRequestConfig = {
      baseURL: SMS_PROVIDER_URL,
      timeout: +SMS_PROVIDER_TIMEOUT,
      headers: {
        [SMSProvider.isVendorZNS ? 'x-api-key' : 'API_KEY'] : SMS_PROVIDER_API_KEY,
        'Content-Type': 'application/json'
      },
    };
  
    // if (NODE_ENV === 'development' && !SMSProvider.isVendorZNS) {
    //   config.proxy = {
    //     host: PROXY_SERVER_URL,
    //     port: +PROXY_SERVER_PORT,
    //   };
    // }
  
    return axios.create(config);
  }

  static async sendSMS(data: ISendSMS): Promise<any> {
    if (process.env.BY_PASS_SMS) {
      await fakeApi();

      return { 
          data: {
            idOmniMess: 'ICOMNI-586f9dcbea58cca26b3163fa7a6826',
            status: '1',
            code: 'Success'
          }
      }
    }
    
    const payload = SMSProvider.getSMSPayload(data);
    return await SMSProvider.instance.post(SMS_PROVIDER_API_PATH, payload);
  }

  static async getVendorProvider(key: string): Promise<Record<string, any>> {
    const request = SMSProvider.instance.get(SMS_PROVIDER_API_CHECK_CHANNEL_PATH, {
      params: {
        idOmniMess: key
      }
    });

    return SMSProvider.retryRequest(request);
  }

  static async retryRequest(req: Promise<AxiosResponse<any>>, retry = 1): Promise<Record<string, any>> {
    let result: Record<string, any> = {};
    // try execute request
    try {
      const response = await req;
      if (response && response.status == 200) {
        result = response.data;
      }
    } catch (error) {
      console.error(`[OtpProvider] - [getVendorProviderRetry] - [Error]: ${error}`)
    }

    // return or retry:
    if (result?.data?.channel) return result;

    if (retry < 5) {
      return SMSProvider.retryRequest(req, retry + 1);
    }

    return result;
  }
}

function fakeApi() {
  return new Promise((resolve: any, reject: any) => {
    const random = Math.floor(Math.random() * 10000);

    setTimeout(() => {
      if (random % 5 == 0) {
        reject(random);
      } else {
        resolve(random);
      }
    }, random);
  })
}