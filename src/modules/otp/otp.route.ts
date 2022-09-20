import { Validator } from "@services/validator";
import { Route } from "@vcsc/node-core";
import { CheckVendorDto, OtpConfirmDto, OtpGenerateDto } from "../../schema-validators/otp";
import OtpController from "./otp.controller";

// reference documents: https://editor.swagger.io/
export default class OtpRoute extends Route {
  install(): void {
    /**
     * @openapi
     * /otp/generate:
     *   post:
     *     tags:
     *        - Sending otp to users:
     *     summary: SENDING OTP TO USERS
     * 
     *     description: Generate and send OTP to specific phone number or zalo, incase of resending OTP we need messageId to expire old OTP
     * 
     *     requestBody:
     *       description: Generate new OTP
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               phoneNumber:
     *                 type: string
     *                 description: The phone that we want to send OTP to.
     *               otpLength:
     *                 type: number
     *                 description: The length of code that we send to users. (Use 6)
     *               content:
     *                 type: string
     *                 description: Message that users receive (Recently it's hardcode by IT team, it's useless!)
     *               timeToLive:
     *                 type: number
     *                 description: OTP value will expire after "timeToLive" seconds
     *               routeRule:
     *                 type: array
     *                 items:
     *                  type: string
     *                 description: with value of ["1", "3"] the service will take higher priority for ZNS and then SMS. 
     *               messageId:
     *                 type: string
     *                 description: this value is only neccessary in case of resending OTP.
     *             required:
     *              - phoneNumber
     *              - otpLength
     *              - content
     *              - timeToLive
     *              - routeRule
     *
     *     responses:
     *       '200':
     *         description: OK.
     *         content:
     *          application/json:
     *            schema:
     *              type: object
     *              properties:
     *                success: 
     *                  type: boolean
     *                data:
     *                  type: string
     */
    this.post("/otp/generate", Validator.validate(OtpGenerateDto), OtpController.generateOtp);

    /**
     * @openapi
     * /otp/confirm:
     *   post:
     *     tags:
     *        - Verifying otp:
     *     summary: VERIFYING OTP
     * 
     *     description: Validate weather the OTP value that users input is valid or not!
     * 
     *     requestBody:
     *       description: Generate new OTP
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               phoneNumber:
     *                 type: string
     *                 description: The phone number receiving OTP.
     *               code:
     *                 type: string
     *                 description: OTP value sent to users
     *               messageId:
     *                 type: string
     *                 description: key responsed when generating OTP
     *             required:
     *              - phoneNumber
     *              - code
     *              - messsageId
     *
     *     responses:
     *       '200':
     *         description: OK.
     *         content:
     *          application/json:
     *            schema:
     *              type: object
     *              properties:
     *                success: 
     *                  type: boolean
     */
    this.post("/otp/confirm", Validator.validate(OtpConfirmDto), OtpController.confirmOtp);

    /**
     * @openapi
     * /otp/checkChannel:
     *   post:
     *     summary: Checking channel OTP
     *     tags:
     *        - Checking channel
     * 
     *     requestBody:
     *       description: Generate new OTP
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               messsageId:
     *                 type: string
     *                 description: key responsed when generating OTP.
     *             required:
     *              - messsageId
     *
     *     responses:
     *       '200':
     *         description: OK.
     *         content:
     *          application/json:
     *            schema:
     *              type: object
     *              properties:
     *                success: 
     *                  type: boolean
     *                message:
     *                  type: string
     *                data:
     *                  type: object
     */
    this.post('/otp/checkChannel', Validator.validate(CheckVendorDto), OtpController.checkVendorProvider);
  }
}
