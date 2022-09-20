import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateIf } from "class-validator";
import { DTOMessages } from "src/constants/error-msgs";

export class OtpGenerateDto {
  @IsNotEmpty({ message: DTOMessages.required })
  @IsString({ message: DTOMessages.invalidType })
  phoneNumber!: string;

  @IsNotEmpty({ message: DTOMessages.required })
  @IsNumber()
  otpLength: number;

  @IsString({ message: DTOMessages.invalidType })
  content: string;

  @IsNotEmpty({ message: DTOMessages.required })
  @IsNumber()
  timeToLive: number;

  @ValidateIf(o => typeof o.routeRule !== 'undefined')
  @IsArray({ message: DTOMessages.invalidType })
  // create more validation for string in array, ['1', '2', '6']
  routeRule: Array<string>

  @ValidateIf(o => typeof o.messageId !== 'undefined')
  @IsString({ message: DTOMessages.invalidType })
  messageId: string;
}

export class OtpConfirmDto {
  @IsNotEmpty({ message: DTOMessages.required })
  @IsString({ message: DTOMessages.invalidType })
  phoneNumber!: string;

  @IsNotEmpty({ message: DTOMessages.required })
  @IsString({ message: DTOMessages.invalidType })
  code!: string;

  @IsString({ message: DTOMessages.invalidType })
  messageId!: string;
}

export class CheckVendorDto {
  @IsNotEmpty({ message: DTOMessages.required })
  @IsString({ message: DTOMessages.invalidType })
  messageId!: string;
  
}