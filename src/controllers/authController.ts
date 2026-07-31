import type { Request, Response } from "express";
import catchAsync from "@src/utils/catchAsync";
import sendResponse from "@src/utils/sendResponse";
import {
  signupService,
  verifyOtpService,
  resendOtpService,
  signinService,
  rotateTokenService,
  getMeService,
} from "@src/services/authServices";
import type {
  SignupBody,
  VerifyOtpBody,
  ResendOtpBody,
  SigninBody,
} from "@src/types/authTypes";
import {
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from "@src/utils/authUtils";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
} from "@src/constants/authConstants";

// FUNCTION
const signup = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const body = req.validatedBody as SignupBody;

    const data = await signupService(body);

    sendResponse(res, 201, {
      status: "success",
      message: "Signup successful. Please verify the OTP sent to your email.",
      data,
    });
  },
);

// FUNCTION
const verifyOtp = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const body = req.validatedBody as VerifyOtpBody;

    const data = await verifyOtpService(body);

    sendResponse(res, 200, {
      status: "success",
      message: "Account verified successfully",
      data,
    });
  },
);

// FUNCTION
const resendOtp = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const body = req.validatedBody as ResendOtpBody;

    const data = await resendOtpService(body);

    sendResponse(res, 200, {
      status: "success",
      message: "OTP resent successfully",
      data,
    });
  },
);

// FUNCTION
const signin = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const body = req.validatedBody as SigninBody;

    const { user, accessToken, refreshToken } = await signinService(body);

    res
      .cookie(
        ACCESS_TOKEN_COOKIE_NAME,
        accessToken,
        getAccessTokenCookieOptions(),
      )
      .cookie(
        REFRESH_TOKEN_COOKIE_NAME,
        refreshToken,
        getRefreshTokenCookieOptions(),
      );

    sendResponse(res, 200, {
      status: "success",
      message: "Signin successful",
      data: { user },
    });
  },
);

// FUNCTION
const rotateToken = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME] as
      | string
      | undefined;

    const {
      accessToken,
      refreshToken: newRefreshToken,
    } = await rotateTokenService(refreshToken);

    res
      .cookie(
        ACCESS_TOKEN_COOKIE_NAME,
        accessToken,
        getAccessTokenCookieOptions(),
      )
      .cookie(
        REFRESH_TOKEN_COOKIE_NAME,
        newRefreshToken,
        getRefreshTokenCookieOptions(),
      );

    sendResponse(res, 200, {
      status: "success",
      message: "Token refreshed successfully",
      data: null,
    });
  },
);

// FUNCTION
const getMe = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!._id;

    const data = await getMeService(userId);

    sendResponse(res, 200, {
      status: "success",
      message: "User fetched successfully",
      data,
    });
  },
);

export { signup, verifyOtp, resendOtp, signin, rotateToken, getMe };
