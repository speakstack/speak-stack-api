import { Injectable, Logger } from "@nestjs/common";
import { Resend } from "resend";
import { AppException } from "../common/exceptions/app.exception";
import { ErrorCode } from "../common/enums/error-code.enum";

const RESEND_API_KEY = Bun.env.RESEND_API_KEY;
const MAIL_FROM = Bun.env.MAIL_FROM || "onboarding@resend.dev";

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
        from: MAIL_FROM,
        to: email,
        subject: "Your verification code",
        html: `
          <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
            <h2>Verification Code</h2>
            <p>Your verification code is:</p>
            <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 16px; background: #f4f4f4; border-radius: 8px;">${otp}</p>
            <p>This code expires in 5 minutes.</p>
            <p style="color: #666; font-size: 12px;">If you didn't request this code, you can safely ignore this email.</p>
          </div>
        `,
      });
      this.logger.log(`OTP email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${email}: ${error}`);
      throw new AppException(ErrorCode.MAIL_SERVICE_ERROR);
    }
  }
}
