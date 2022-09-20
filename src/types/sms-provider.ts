export enum SmsProviderVendor {
  SMS = 'SMS',
  ZNS = 'ZNS'
}
export interface ICallSMSProvider {
  phoneNumber: string;
  code: string;
  routeRule?: Array<string>
}
export interface ISendSMS extends ICallSMSProvider {
  content: string;
  timeToLiveInSecond: number;
}
export interface ISmsProviderConfiguration {
  proxy?: { host: string; port: number; };
  baseURL: string;
  timeout: number;
  headers: Record<string, string | undefined>;
}
export interface ISendSMSResponse {
  idOmniMess: string;
  status: string;
  code: string;
}