import type { Request, Response } from "express";
import catchAsync from "@src/utils/catchAsync";
import sendResponse from "@src/utils/sendResponse";
import {
  createTripService,
  getTripsService,
  getTripByIdService,
  updateTripService,
  deleteTripService,
} from "@src/services/tripService";
import type { CreateTripBody, GetTripsQuery } from "@src/types/tripType";

// FUNCTION
const createTrip = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const body = req.validatedBody as CreateTripBody;

    const data = await createTripService(body, req.user!._id);

    sendResponse(res, 201, {
      status: "success",
      message: "Trip created successfully",
      data,
    });
  },
);

// FUNCTION
const getTrips = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const query = req.validatedQuery as GetTripsQuery;

    const { trips, pagination } = await getTripsService(query, req.user!);

    sendResponse(res, 200, {
      status: "success",
      message: "Trips fetched successfully",
      data: { trips, pagination },
    });
  },
);

// FUNCTION
const getTripById = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;

    const data = await getTripByIdService(id, req.user!);

    sendResponse(res, 200, {
      status: "success",
      message: "Trip fetched successfully",
      data,
    });
  },
);

// FUNCTION
const updateTrip = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const body = req.validatedBody as CreateTripBody;

    const data = await updateTripService(id, body, req.user!);

    sendResponse(res, 200, {
      status: "success",
      message: "Trip updated successfully",
      data,
    });
  },
);

// FUNCTION
const deleteTrip = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;

    await deleteTripService(id, req.user!);

    sendResponse(res, 200, {
      status: "success",
      message: "Trip deleted successfully",
      data: null,
    });
  },
);

export { createTrip, getTrips, getTripById, updateTrip, deleteTrip };
