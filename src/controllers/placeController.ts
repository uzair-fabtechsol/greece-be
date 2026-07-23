import type { Request, Response } from "express";
import catchAsync from "@src/utils/catchAsync";
import sendResponse from "@src/utils/sendResponse";
import {
  createPlaceService,
  getPlacesService,
  getPlaceByIdService,
  updatePlaceService,
  deletePlaceService,
} from "@src/services/placeServices";
import type {
  CreatePlaceBody,
  UpdatePlaceBody,
  GetPlacesQuery,
} from "@src/types/placeTypes";

// FUNCTION
const createPlace = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const body = req.body as CreatePlaceBody;

    const data = await createPlaceService(body);

    sendResponse(res, 201, {
      status: "success",
      message: "Place created successfully",
      data,
    });
  },
);

// FUNCTION
const getPlaces = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const query = req.validatedQuery as unknown as GetPlacesQuery;

    const { places, pagination } = await getPlacesService(query);

    sendResponse(res, 200, {
      status: "success",
      message: "Places fetched successfully",
      data: { places, pagination },
    });
  },
);

// FUNCTION
const getPlaceById = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;

    const data = await getPlaceByIdService(id);

    sendResponse(res, 200, {
      status: "success",
      message: "Place fetched successfully",
      data,
    });
  },
);

// FUNCTION
const updatePlace = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const body = req.body as UpdatePlaceBody;

    const data = await updatePlaceService(id, body);

    sendResponse(res, 200, {
      status: "success",
      message: "Place updated successfully",
      data,
    });
  },
);

// FUNCTION
const deletePlace = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;

    await deletePlaceService(id);

    sendResponse(res, 200, {
      status: "success",
      message: "Place deleted successfully",
      data: null,
    });
  },
);

export { createPlace, getPlaces, getPlaceById, updatePlace, deletePlace };
