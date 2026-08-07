import TripModel from "@src/models/tripModel";
import { Role } from "@src/models/userModel";
import AppError from "@src/utils/appError";
import APIFeatures from "@src/utils/apiFeatures";
import {
  validateTripReferences,
  validateTripReferenceParents,
} from "@src/utils/tripUtils";
import type {
  CreateTripBody,
  UpdateTripBody,
  GetTripsQuery,
} from "@src/types/tripType";

const ADMIN_ROLES: string[] = [Role.SuperAdmin, Role.Admin];

// FUNCTION
const createTripService = async (
  body: CreateTripBody,
  travellerId: string,
) => {
  // 1 : Verify every submitted region/destination/place/restaurant/
  // activity/food id actually exists
  await validateTripReferences(body);

  // 2 : Verify each destination/place/activity/food/restaurant belongs to
  // the correct parent submitted alongside it
  await validateTripReferenceParents(body);

  // 3 : Create the trip, owned by the requesting traveller
  const trip = await TripModel.create({ ...body, traveller: travellerId });

  // 4 : Send response
  return { trip };
};

// FUNCTION
const getTripsService = async (
  query: GetTripsQuery,
  reqUser: { _id: string; role: string },
) => {
  // 1 : Non-admins are always scoped to their own trips; admins may
  // optionally filter down to a specific traveller via the query
  const filterQuery = {
    ...query,
    traveller: ADMIN_ROLES.includes(reqUser.role)
      ? query.traveller
      : reqUser._id,
  };

  // 2 : Build and run the aggregation pipeline to get the page of results
  // and the total count in one round trip
  const { data: trips, pagination } = await new APIFeatures(
    TripModel,
    filterQuery,
    [],
  )
    .filter(["traveller"])
    .sort()
    .paginate()
    .exec();

  // 3 : Send response
  return { trips, pagination };
};

// FUNCTION
const getTripByIdService = async (
  id: string,
  reqUser: { _id: string; role: string },
) => {
  // 1 : Find the trip by id
  const trip = await TripModel.findById(id);
  if (!trip) {
    throw new AppError(404, "Trip not found");
  }

  // 2 : Only the owner or an admin may view it
  if (
    trip.traveller.toString() !== reqUser._id &&
    !ADMIN_ROLES.includes(reqUser.role)
  ) {
    throw new AppError(403, "You do not have permission to access this trip");
  }

  // 3 : Send response
  return { trip };
};

// FUNCTION
const updateTripService = async (
  id: string,
  body: UpdateTripBody,
  reqUser: { _id: string; role: string },
) => {
  // 1 : Find the trip to update
  const trip = await TripModel.findById(id);
  if (!trip) {
    throw new AppError(404, "Trip not found");
  }

  // 2 : Only the owner or an admin may update it
  if (
    trip.traveller.toString() !== reqUser._id &&
    !ADMIN_ROLES.includes(reqUser.role)
  ) {
    throw new AppError(403, "You do not have permission to update this trip");
  }

  // 3 : Verify every submitted reference id actually exists
  await validateTripReferences(body);

  // 4 : Verify each destination/place/activity/food/restaurant belongs to
  // the correct parent submitted alongside it. Only pairs actually present
  // in this partial update are checked (see validateTripReferenceParents).
  await validateTripReferenceParents(body);

  // 5 : Apply the update and persist it
  Object.assign(trip, body);
  await trip.save();

  // 6 : Send response
  return { trip };
};

// FUNCTION
const deleteTripService = async (
  id: string,
  reqUser: { _id: string; role: string },
) => {
  // 1 : Find the trip to delete
  const trip = await TripModel.findById(id);
  if (!trip) {
    throw new AppError(404, "Trip not found");
  }

  // 2 : Only the owner or an admin may delete it
  if (
    trip.traveller.toString() !== reqUser._id &&
    !ADMIN_ROLES.includes(reqUser.role)
  ) {
    throw new AppError(403, "You do not have permission to delete this trip");
  }

  // 3 : Delete the trip
  await trip.deleteOne();

  // 4 : Send response
  return null;
};

export {
  createTripService,
  getTripsService,
  getTripByIdService,
  updateTripService,
  deleteTripService,
};
