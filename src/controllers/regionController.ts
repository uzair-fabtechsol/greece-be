import type { Request, Response } from "express";
import catchAsync from "@src/utils/catchAsync";
import sendResponse from "@src/utils/sendResponse";
import { buildRegionRecommendationsQuery } from "@src/utils/regionUtils";
import {
  createRegionService,
  getRegionsService,
  getRegionByIdService,
  updateRegionService,
  deleteRegionService,
} from "@src/services/regionService";
import type {
  CreateRegionBody,
  UpdateRegionBody,
  GetRegionsQuery,
  GetRegionRecommendationsQuery,
} from "@src/types/regionType";

// FUNCTION
const createRegion = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const body = req.validatedBody as CreateRegionBody;

    const data = await createRegionService(body);

    sendResponse(res, 201, {
      status: "success",
      message: "Region created successfully",
      data,
    });
  },
);

// FUNCTION
const getRegions = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const query = req.validatedQuery as GetRegionsQuery;

    const { regions, pagination } = await getRegionsService(query);

    sendResponse(res, 200, {
      status: "success",
      message: "Regions fetched successfully",
      data: { regions, pagination },
    });
  },
);

// FUNCTION
const getRegionById = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;

    const data = await getRegionByIdService(id);

    sendResponse(res, 200, {
      status: "success",
      message: "Region fetched successfully",
      data,
    });
  },
);

// FUNCTION
const updateRegion = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const body = req.validatedBody as UpdateRegionBody;

    const data = await updateRegionService(id, body);

    sendResponse(res, 200, {
      status: "success",
      message: "Region updated successfully",
      data,
    });
  },
);

// FUNCTION
const deleteRegion = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;

    await deleteRegionService(id);

    sendResponse(res, 200, {
      status: "success",
      message: "Region deleted successfully",
      data: null,
    });
  },
);

// FUNCTION
const getRegionsRecommendations = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const interests = req.validatedQuery as GetRegionRecommendationsQuery;

    const query = buildRegionRecommendationsQuery(interests);

    console.log("query------------------------", query);

    const { regions, pagination } = await getRegionsService(query);

    sendResponse(res, 200, {
      status: "success",
      message: "Regions fetched successfully",
      data: { regions, pagination },
    });
  },
);

export {
  createRegion,
  getRegions,
  getRegionById,
  updateRegion,
  deleteRegion,
  getRegionsRecommendations,
};
