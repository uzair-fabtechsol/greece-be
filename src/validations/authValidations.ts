import { z } from "zod";
import { OTP_LENGTH, PASSWORD_MIN_LENGTH } from "@src/constants/authConstants";
import {
  NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
} from "@src/constants/limitConstants";
import { SIGNUP_ROLES } from "@src/models/userModel";

const signupSchema = z.object({
  fullName: z.string().trim().min(NAME_MIN_LENGTH).max(NAME_MAX_LENGTH),
  email: z.email().trim().toLowerCase(),
  password: z.string().min(PASSWORD_MIN_LENGTH),
  // Restricted to traveller/advertiser so a client can never sign itself up
  // as an admin or superAdmin
  role: z.enum(SIGNUP_ROLES),
});

const verifyOtpSchema = z.object({
  email: z.email().trim().toLowerCase(),
  otp: z.string().length(OTP_LENGTH),
});

const resendOtpSchema = z.object({
  email: z.email().trim().toLowerCase(),
});

const signinSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(PASSWORD_MIN_LENGTH),
});

export { signupSchema, verifyOtpSchema, resendOtpSchema, signinSchema };
