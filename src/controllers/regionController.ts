import type { Request, Response } from "express";
import catchAsync from "@src/utils/catchAsync";
import sendResponse from "@src/utils/sendResponse";
import {
  createRegionService,
  getRegionsService,
  getRegionByIdService,
  updateRegionService,
  deleteRegionService,
} from "@src/services/regionServices";
import type {
  CreateRegionBody,
  UpdateRegionBody,
  GetRegionsQuery,
} from "@src/types/regionTypes";

// FUNCTION
const createRegion = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const body = req.body as CreateRegionBody;

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
    const query = req.validatedQuery as unknown as GetRegionsQuery;

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
    const body = req.body as UpdateRegionBody;

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

export { createRegion, getRegions, getRegionById, updateRegion, deleteRegion };
