export interface GenerateOtpReq {
  phoneNumber: string;
  otpLength: number;
  content: string;
  timeToLive: number;
  routeRule?: string[] | undefined;
  messageId?: string | undefined;
}

export interface ConfirmOtpReq {
  code: string;
  phoneNumber: string;
  messageId: string;
}

export interface CheckVendorReq {
  messageId: string;
}