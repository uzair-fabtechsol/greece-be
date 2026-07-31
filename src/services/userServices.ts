import type { PipelineStage } from "mongoose";
import bcrypt from "bcryptjs";
import UserModel from "@src/models/userModel";
import AppError from "@src/utils/appError";
import APIFeatures from "@src/utils/apiFeatures";
import { sendAdminCredentialsEmail } from "@src/utils/userUtils";
import { BCRYPT_SALT_ROUNDS } from "@src/constants/authConstants";
import { USER_PRIVATE_FIELDS } from "@src/constants/userConstants";
import type { CreateUserBody, GetUsersQuery } from "@src/types/userTypes";

// FUNCTION
const createUserService = async (body: CreateUserBody) => {
  // 1 : Extract the admin details from the request body
  const { fullName, email, password, role } = body;

  // 2 : Check if the email is already registered
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw new AppError(400, "Email is already registered");
  }

  // 3 : Hash the password
  const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  // 4 : Create the admin. A superAdmin vouching for them is the verification,
  // so there is no OTP round trip and the account is usable immediately.
  const user = await UserModel.create({
    fullName,
    email,
    password: hashedPassword,
    role,
    otp: null,
    otpExpiresAt: null,
    isVerified: true,
  });

  // 5 : Email the credentials to the new admin
  await sendAdminCredentialsEmail(fullName, email, password);

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
const getUsersService = async (query: GetUsersQuery) => {
  // 1 : Aggregation bypasses the schema's `select: false`, so strip the
  // credential fields up front. Dropping them first also means a client
  // projection can never bring them back.
  const basePipeline: PipelineStage[] = [
    { $unset: [...USER_PRIVATE_FIELDS] },
  ];

  // 2 : Build and run the aggregation pipeline to get the page of results
  // and the total count in one round trip
  const { data: users, pagination } = await new APIFeatures(
    UserModel,
    query,
    basePipeline,
  )
    .filter(["role", "isVerified"])
    .search(["fullName", "email"])
    .sort()
    .projection()
    .paginate()
    .exec();

  // 3 : Send response
  return { users, pagination };
};

// FUNCTION
const getUserByIdService = async (id: string) => {
  // 1 : Fetch the user, leaving out the credential fields
  const user = await UserModel.findById(id).select(
    USER_PRIVATE_FIELDS.map((field) => `-${field}`).join(" "),
  );
  if (!user) {
    throw new AppError(404, "User not found");
  }

  // 2 : Send response
  return { user };
};

export { createUserService, getUsersService, getUserByIdService };
