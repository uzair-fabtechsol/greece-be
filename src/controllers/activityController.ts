import type { Request, Response } from "express";
import catchAsync from "@src/utils/catchAsync";
import sendResponse from "@src/utils/sendResponse";
import {
  createActivityService,
  getActivitiesService,
  getActivityByIdService,
  updateActivityService,
  deleteActivityService,
} from "@src/services/activityServices";
import type {
  CreateActivityBody,
  UpdateActivityBody,
  GetActivitiesQuery,
} from "@src/types/activityTypes";

// FUNCTION
const createActivity = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const body = req.body as CreateActivityBody;

    const data = await createActivityService(body);

    sendResponse(res, 201, {
      status: "success",
      message: "Activity created successfully",
      data,
    });
  },
);

// FUNCTION
const getActivities = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const query = req.validatedQuery as unknown as GetActivitiesQuery;

    const { activities, pagination } = await getActivitiesService(query);

    sendResponse(res, 200, {
      status: "success",
      message: "Activities fetched successfully",
      data: { activities, pagination },
    });
  },
);

// FUNCTION
const getActivityById = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;

    const data = await getActivityByIdService(id);

    sendResponse(res, 200, {
      status: "success",
      message: "Activity fetched successfully",
      data,
    });
  },
);

// FUNCTION
const updateActivity = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const body = req.body as UpdateActivityBody;

    const data = await updateActivityService(id, body);

    sendResponse(res, 200, {
      status: "success",
      message: "Activity updated successfully",
      data,
    });
  },
);

// FUNCTION
const deleteActivity = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;

    await deleteActivityService(id);

    sendResponse(res, 200, {
      status: "success",
      message: "Activity deleted successfully",
      data: null,
    });
  },
);

export {
  createActivity,
  getActivities,
  getActivityById,
  updateActivity,
  deleteActivity,
};
