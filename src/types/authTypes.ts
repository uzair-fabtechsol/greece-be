import type { z } from "zod";
import type {
  signupSchema,
  verifyOtpSchema,
  resendOtpSchema,
  signinSchema,
} from "@src/validations/authValidations";

type SignupBody = z.infer<typeof signupSchema>;
type VerifyOtpBody = z.infer<typeof verifyOtpSchema>;
type ResendOtpBody = z.infer<typeof resendOtpSchema>;
type SigninBody = z.infer<typeof signinSchema>;

export type { SignupBody, VerifyOtpBody, ResendOtpBody, SigninBody };
