import { model, models, Schema, type InferSchemaType } from "mongoose";
import { OTP_LENGTH, PASSWORD_MIN_LENGTH } from "@src/constants/authConstants";
import {
  NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
} from "@src/constants/limitConstants";

enum Role {
  Admin = "admin",
  Traveller = "traveller",
}

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: NAME_MIN_LENGTH,
      maxlength: NAME_MAX_LENGTH,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      type: String,
      required: true,
      select: false,
      minlength: PASSWORD_MIN_LENGTH,
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.Traveller,
    },
    otp: {
      type: String,
      default: null,
      minlength: OTP_LENGTH,
      maxlength: OTP_LENGTH,
    },
    otpExpiresAt: {
      type: Date,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

type UserType = InferSchemaType<typeof userSchema>;

const UserModel = models.User || model<UserType>("User", userSchema);

export default UserModel;
export { Role };
export type { UserType };
