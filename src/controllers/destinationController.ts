import type { Request, Response } from "express";
import catchAsync from "@src/utils/catchAsync";
import sendResponse from "@src/utils/sendResponse";
import {
  createDestinationService,
  getDestinationsService,
  getDestinationByIdService,
  updateDestinationService,
  deleteDestinationService,
} from "@src/services/destinationServices";
import type {
  CreateDestinationBody,
  UpdateDestinationBody,
  GetDestinationsQuery,
} from "@src/types/destinationTypes";

// FUNCTION
const createDestination = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const body = req.body as CreateDestinationBody;

    const data = await createDestinationService(body);

    sendResponse(res, 201, {
      status: "success",
      message: "Destination created successfully",
      data,
    });
  },
);

// FUNCTION
const getDestinations = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const query = req.validatedQuery as unknown as GetDestinationsQuery;

    const { destinations, pagination } = await getDestinationsService(query);

    sendResponse(res, 200, {
      status: "success",
      message: "Destinations fetched successfully",
      data: { destinations, pagination },
    });
  },
);

// FUNCTION
const getDestinationById = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;

    const data = await getDestinationByIdService(id);

    sendResponse(res, 200, {
      status: "success",
      message: "Destination fetched successfully",
      data,
    });
  },
);

// FUNCTION
const updateDestination = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const body = req.body as UpdateDestinationBody;

    const data = await updateDestinationService(id, body);

    sendResponse(res, 200, {
      status: "success",
      message: "Destination updated successfully",
      data,
    });
  },
);

// FUNCTION
const deleteDestination = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;

    await deleteDestinationService(id);

    sendResponse(res, 200, {
      status: "success",
      message: "Destination deleted successfully",
      data: null,
    });
  },
);

export {
  createDestination,
  getDestinations,
  getDestinationById,
  updateDestination,
  deleteDestination,
};
