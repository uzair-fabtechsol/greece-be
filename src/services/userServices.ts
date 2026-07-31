import type { PipelineStage } from "mongoose";
import UserModel from "@src/models/userModel";
import AppError from "@src/utils/appError";
import APIFeatures from "@src/utils/apiFeatures";
import { USER_PRIVATE_FIELDS } from "@src/constants/userConstants";
import type { GetUsersQuery } from "@src/types/userTypes";

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

export { getUsersService, getUserByIdService };
