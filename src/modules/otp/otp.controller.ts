import { GenerateOtpReq } from "@type/otp-service-type";
import OtpService from "./otp.service";

export default class OtpController {
  static async generateOtp(_: any, req: any): Promise<any> {    
    const data: GenerateOtpReq = req.body;
    let result;

    if (!data.messageId) {
      result = await OtpService.generateOtp(data);
    } else {
      result = await OtpService.resendOtp(data);
    }

    return { success: Boolean(result), data: result };
  }

  static async confirmOtp(_: any, req: any): Promise<any> {
    const result = await OtpService.confirmOtp(req.body);

    console.info(`CONFIRM OTP is successfully!!! ✅`)

    return { success: result };
  }

  static async checkVendorProvider(_: any, req: any): Promise<any> {
    const result = await OtpService.checkVendorProvider({ messageId: req.body?.messageId });
    
    return result;
  }
}