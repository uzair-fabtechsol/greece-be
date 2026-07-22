import bcrypt from "bcryptjs";
import UserModel from "@src/models/userModel";
import AppError from "@src/utils/appError";
import {
  BCRYPT_SALT_ROUNDS,
  OTP_EXPIRY_MINUTES,
} from "@src/constants/authConstants";
import type {
  SignupBody,
  VerifyOtpBody,
  ResendOtpBody,
  SigninBody,
} from "@src/types/authTypes";
import {
  generateOtp,
  sendOtpEmail,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "@src/utils/authUtils";

// FUNCTION
const signupService = async (body: SignupBody) => {
  // 1 : Extract user details from the request body
  const { fullName, email, password } = body;

  // 2 : Check if the email is already registered
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw new AppError(400, "Email is already registered");
  }

  // 3 : Hash the password, generate OTP, and set OTP expiry
  const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // 4 : Create the new user in the database
  const newUser = await UserModel.create({
    fullName,
    email,
    password: hashedPassword,
    otp,
    otpExpiresAt,
  });

  // 5 : Send the OTP to the user's email
  await sendOtpEmail(email, otp);

  // 6 : Send response
  return {
    user: {
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      isVerified: newUser.isVerified,
    },
  };
};

// FUNCTION
const verifyOtpService = async (body: VerifyOtpBody) => {
  // 1 : Extract email and otp from the request body
  const { email, otp } = body;

  // 2 : Find the user by email
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new AppError(404, "No account found with this email");
  }

  // 3 : Reject if the user is already verified
  if (user.isVerified) {
    throw new AppError(400, "Account is already verified");
  }

  // 4 : Validate the OTP and its expiry
  if (!user.otp || !user.otpExpiresAt || user.otp !== otp) {
    throw new AppError(400, "Invalid OTP");
  }

  if (user.otpExpiresAt.getTime() < Date.now()) {
    throw new AppError(400, "OTP has expired");
  }

  // 5 : Mark the user as verified and clear the OTP fields
  user.isVerified = true;
  user.otp = null;
  user.otpExpiresAt = null;
  await user.save();

  // 6 : Send response
  return {
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    },
  };
};

// FUNCTION
const resendOtpService = async (body: ResendOtpBody) => {
  // 1 : Extract email from the request body
  const { email } = body;

  // 2 : Find the user by email
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new AppError(404, "No account found with this email");
  }

  // 3 : Reject if the user is already verified
  if (user.isVerified) {
    throw new AppError(400, "Account is already verified");
  }

  // 4 : Generate a new OTP and expiry, then save
  const otp = generateOtp();
  user.otp = otp;
  user.otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  await user.save();

  // 5 : Send the new OTP to the user's email
  await sendOtpEmail(email, otp);

  // 6 : Send response
  return {
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    },
  };
};

// FUNCTION
const signinService = async (body: SigninBody) => {
  // 1 : Extract email and password from the request body
  const { email, password } = body;

  // 2 : Find the user by email, including the password field
  const user = await UserModel.findOne({ email }).select("+password");
  if (!user) {
    throw new AppError(401, "Incorrect email or password");
  }

  // 3 : Compare the provided password with the hashed password
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw new AppError(401, "Incorrect email or password");
  }

  // 4 : Reject login if the account is not verified
  if (!user.isVerified) {
    throw new AppError(403, "Please verify your account before logging in");
  }

  // 5 : Generate access and refresh tokens
  const payload = { id: user._id.toString(), role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // 6 : Send response
  return {
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    },
    accessToken,
    refreshToken,
  };
};

// FUNCTION
const rotateTokenService = async (refreshToken: string | undefined) => {
  // 1 : Reject if no refresh token was provided
  if (!refreshToken) {
    throw new AppError(401, "No refresh token provided. Please log in again");
  }

  // 2 : Verify the refresh token
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(401, "Invalid or expired refresh token. Please log in again");
  }

  // 3 : Ensure the user still exists
  const user = await UserModel.findById(payload.id);
  if (!user) {
    throw new AppError(401, "User no longer exists. Please log in again");
  }

  // 4 : Issue a new access and refresh token pair
  const newPayload = { id: user._id.toString(), role: user.role };
  const accessToken = generateAccessToken(newPayload);
  const newRefreshToken = generateRefreshToken(newPayload);

  // 5 : Send response
  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
};

// FUNCTION
const getMeService = async (userId: string) => {
  // 1 : Find the user by id
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError(404, "User not found");
  }

  // 2 : Send response
  return {
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    },
  };
};

export {
  signupService,
  verifyOtpService,
  resendOtpService,
  signinService,
  rotateTokenService,
  getMeService,
};
