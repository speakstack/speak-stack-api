import { Injectable, Logger } from "@nestjs/common";
import { Resend } from "resend";
import { AppException } from "../common/exceptions/app.exception";
import { ErrorCode } from "../common/enums/error-code.enum";

const RESEND_API_KEY = Bun.env.RESEND_API_KEY;

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend;

  constructor() {
    this.resend = new Resend(RESEND_API_KEY);
  }

  async sendOtp(email: string, otp: string): Promise<void> {
    try {
      await this.resend.emails.send({
        to: email,
        template: {
          id: "otp-verification",
          variables: {
            OTP: otp,
            USER_EMAIL: email,
            YEAR: new Date().getFullYear().toString(),
          },
        },
      });
      this.logger.log(`OTP email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${email}: ${error}`);
      throw new AppException(ErrorCode.MAIL_SERVICE_ERROR);
    }
  }
}
