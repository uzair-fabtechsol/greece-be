import jwt from "jsonwebtoken";
import type { CookieOptions } from "express";
import { OTP_LENGTH, OTP_EXPIRY_MINUTES } from "@src/constants/authConstants";
import transporter from "@src/config/mailer";
import { env } from "@src/config/env";

interface TokenPayload {
  id: string;
  role: string;
}

// FUNCTION
const generateOtp = (): string => {
  const min = 10 ** (OTP_LENGTH - 1);
  const max = 10 ** OTP_LENGTH - 1;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
};

// FUNCTION
const buildOtpEmailHtml = (otp: string): string => {
  const digits = otp.split("");

  return `
  <div style="background-color:#EEF3F6;padding:32px 16px;font-family:Segoe UI,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(10,42,64,0.15);">
      <tr>
        <td style="background-color:#0A2A40;padding:28px 32px;text-align:center;">
          <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:0.5px;">${env.APP_NAME}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:36px 32px 24px 32px;text-align:center;">
          <h1 style="margin:0 0 8px 0;color:#0A2A40;font-size:22px;">Verify your email</h1>
          <p style="margin:0;color:#4A6274;font-size:14px;line-height:1.6;">
            Use the code below to verify your account and start planning your trip to Greece.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 32px 32px 32px;text-align:center;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
            <tr>
              ${digits
                .map(
                  (digit) => `
              <td style="width:40px;height:52px;background-color:#1A5276;border-radius:8px;text-align:center;vertical-align:middle;padding:0 4px;">
                <span style="color:#ffffff;font-size:24px;font-weight:700;">${digit}</span>
              </td>`,
                )
                .join(`<td style="width:8px;"></td>`)}
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:0 32px 32px 32px;text-align:center;">
          <p style="margin:0;color:#4A6274;font-size:13px;line-height:1.6;">
            This code expires in <strong style="color:#1A5276;">${OTP_EXPIRY_MINUTES} minutes</strong>.
            If you didn't request this, you can safely ignore this email.
          </p>
        </td>
      </tr>
      <tr>
        <td style="background-color:#EEF3F6;padding:18px 32px;text-align:center;">
          <p style="margin:0;color:#4A6274;font-size:12px;">
            &copy; ${new Date().getFullYear()} ${env.APP_NAME}. All rights reserved.
          </p>
        </td>
      </tr>
    </table>
  </div>`;
};

// FUNCTION
const sendOtpEmail = async (email: string, otp: string): Promise<void> => {
  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to: email,
    subject: "Your verification code",
    html: buildOtpEmailHtml(otp),
  });
};

// FUNCTION
const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as jwt.SignOptions);
};

// FUNCTION
const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);
};

// FUNCTION
const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
};

// FUNCTION
const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
};

// FUNCTION
const getAuthCookieOptions = (maxAge: number): CookieOptions => {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge,
  };
};

export {
  generateOtp,
  sendOtpEmail,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  getAuthCookieOptions,
};
export type { TokenPayload };
