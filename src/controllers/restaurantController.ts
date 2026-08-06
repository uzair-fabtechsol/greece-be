import type { Request, Response } from "express";
import catchAsync from "@src/utils/catchAsync";
import sendResponse from "@src/utils/sendResponse";
import {
  createRestaurantService,
  getRestaurantsService,
  getRestaurantByIdService,
  updateRestaurantService,
  deleteRestaurantService,
} from "@src/services/restaurantService";
import type {
  CreateRestaurantBody,
  UpdateRestaurantBody,
  UpdateFeaturedStatusBody,
  UpdateIndexableStatusBody,
  GetRestaurantsQuery,
} from "@src/types/restaurantType";

// FUNCTION
const createRestaurant = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const body = req.validatedBody as CreateRestaurantBody;

    const data = await createRestaurantService(body);

    sendResponse(res, 201, {
      status: "success",
      message: "Restaurant created successfully",
      data,
    });
  },
);

// FUNCTION
const getRestaurants = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const query = req.validatedQuery as GetRestaurantsQuery;

    const { restaurants, pagination } = await getRestaurantsService(query);

    sendResponse(res, 200, {
      status: "success",
      message: "Restaurants fetched successfully",
      data: { restaurants, pagination },
    });
  },
);

// FUNCTION
const getRestaurantById = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;

    const data = await getRestaurantByIdService(id);

    sendResponse(res, 200, {
      status: "success",
      message: "Restaurant fetched successfully",
      data,
    });
  },
);

// FUNCTION
const updateRestaurant = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const body = req.validatedBody as UpdateRestaurantBody;

    const data = await updateRestaurantService(id, body);

    sendResponse(res, 200, {
      status: "success",
      message: "Restaurant updated successfully",
      data,
    });
  },
);

// FUNCTION
const deleteRestaurant = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;

    await deleteRestaurantService(id);

    sendResponse(res, 200, {
      status: "success",
      message: "Restaurant deleted successfully",
      data: null,
    });
  },
);

// FUNCTION
const updateRestaurantFeaturedStatus = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const body = req.validatedBody as UpdateFeaturedStatusBody;

    const data = await updateRestaurantService(id, body);

    sendResponse(res, 200, {
      status: "success",
      message: "Restaurant featured status updated successfully",
      data,
    });
  },
);

// FUNCTION
const updateRestaurantIndexableStatus = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const body = req.validatedBody as UpdateIndexableStatusBody;

    const data = await updateRestaurantService(id, body);

    sendResponse(res, 200, {
      status: "success",
      message: "Restaurant indexable status updated successfully",
      data,
    });
  },
);

export {
  createRestaurant,
  getRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
  updateRestaurantFeaturedStatus,
  updateRestaurantIndexableStatus,
};
