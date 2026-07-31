import type { Request, Response } from "express";
import catchAsync from "@src/utils/catchAsync";
import sendResponse from "@src/utils/sendResponse";
import {
  getUsersService,
  getUserByIdService,
} from "@src/services/userServices";
import type { GetUsersQuery } from "@src/types/userTypes";

// FUNCTION
const getUsers = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const query = req.validatedQuery as GetUsersQuery;

    const { users, pagination } = await getUsersService(query);

    sendResponse(res, 200, {
      status: "success",
      message: "Users fetched successfully",
      data: { users, pagination },
    });
  },
);

// FUNCTION
const getUserById = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;

    const data = await getUserByIdService(id);

    sendResponse(res, 200, {
      status: "success",
      message: "User fetched successfully",
      data,
    });
  },
);

export { getUsers, getUserById };
