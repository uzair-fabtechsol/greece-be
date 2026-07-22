import { z } from "zod";

const signupSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: z.email().trim().toLowerCase(),
  password: z.string().min(8),
});

const verifyOtpSchema = z.object({
  email: z.email().trim().toLowerCase(),
  otp: z.string().length(6),
});

const resendOtpSchema = z.object({
  email: z.email().trim().toLowerCase(),
});

const signinSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(8),
});

export { signupSchema, verifyOtpSchema, resendOtpSchema, signinSchema };
