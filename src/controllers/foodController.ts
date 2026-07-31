import type { Request, Response } from "express";
import catchAsync from "@src/utils/catchAsync";
import sendResponse from "@src/utils/sendResponse";
import {
  createFoodService,
  getFoodsService,
  getFoodByIdService,
  updateFoodService,
  deleteFoodService,
} from "@src/services/foodServices";
import type {
  CreateFoodBody,
  UpdateFoodBody,
  UpdateFeaturedStatusBody,
  UpdateIndexableStatusBody,
  GetFoodsQuery,
} from "@src/types/foodTypes";

// FUNCTION
const createFood = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const body = req.validatedBody as CreateFoodBody;

    const data = await createFoodService(body);

    sendResponse(res, 201, {
      status: "success",
      message: "Food created successfully",
      data,
    });
  },
);

// FUNCTION
const getFoods = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const query = req.validatedQuery as GetFoodsQuery;

    const { foods, pagination } = await getFoodsService(query);

    sendResponse(res, 200, {
      status: "success",
      message: "Foods fetched successfully",
      data: { foods, pagination },
    });
  },
);

// FUNCTION
const getFoodById = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;

    const data = await getFoodByIdService(id);

    sendResponse(res, 200, {
      status: "success",
      message: "Food fetched successfully",
      data,
    });
  },
);

// FUNCTION
const updateFood = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const body = req.validatedBody as UpdateFoodBody;

    const data = await updateFoodService(id, body);

    sendResponse(res, 200, {
      status: "success",
      message: "Food updated successfully",
      data,
    });
  },
);

// FUNCTION
const deleteFood = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;

    await deleteFoodService(id);

    sendResponse(res, 200, {
      status: "success",
      message: "Food deleted successfully",
      data: null,
    });
  },
);

// FUNCTION
const updateFoodFeaturedStatus = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const body = req.validatedBody as UpdateFeaturedStatusBody;

    const data = await updateFoodService(id, body);

    sendResponse(res, 200, {
      status: "success",
      message: "Food featured status updated successfully",
      data,
    });
  },
);

// FUNCTION
const updateFoodIndexableStatus = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const body = req.validatedBody as UpdateIndexableStatusBody;

    const data = await updateFoodService(id, body);

    sendResponse(res, 200, {
      status: "success",
      message: "Food indexable status updated successfully",
      data,
    });
  },
);

export {
  createFood,
  getFoods,
  getFoodById,
  updateFood,
  deleteFood,
  updateFoodFeaturedStatus,
  updateFoodIndexableStatus,
};
