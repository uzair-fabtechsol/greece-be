import { Types, type PipelineStage } from "mongoose";
import TripModel from "@src/models/tripModel";
import { Role } from "@src/models/userModel";
import AppError from "@src/utils/appError";
import APIFeatures from "@src/utils/apiFeatures";
import {
  validateTripReferences,
  validateTripReferenceParents,
} from "@src/utils/tripUtils";
import { USER_PRIVATE_FIELDS } from "@src/constants/userConstant";
import type { CreateTripBody, GetTripsQuery } from "@src/types/tripType";

const ADMIN_ROLES: string[] = [Role.SuperAdmin, Role.Admin];

const tripLookupStages: PipelineStage.FacetPipelineStage[] = [
  {
    $lookup: {
      from: "users",
      localField: "traveller",
      foreignField: "_id",
      as: "travellerDetails",
      pipeline: [{ $unset: [...USER_PRIVATE_FIELDS] }],
    },
  },
  { $unwind: "$travellerDetails" },
  {
    $lookup: {
      from: "regions",
      localField: "regions",
      foreignField: "_id",
      as: "regionsDetails",
    },
  },
  {
    $lookup: {
      from: "destinations",
      localField: "destinations",
      foreignField: "_id",
      as: "destinationsDetails",
    },
  },
  {
    $lookup: {
      from: "places",
      localField: "places",
      foreignField: "_id",
      as: "placesDetails",
    },
  },
  {
    $lookup: {
      from: "restaurants",
      localField: "restaurants",
      foreignField: "_id",
      as: "restaurantsDetails",
    },
  },
  {
    $lookup: {
      from: "activities",
      localField: "activities",
      foreignField: "_id",
      as: "activitiesDetails",
    },
  },
  {
    $lookup: {
      from: "foods",
      localField: "foods",
      foreignField: "_id",
      as: "foodsDetails",
    },
  },
  {
    $project: {
      traveller: 0,
      regions: 0,
      destinations: 0,
      places: 0,
      restaurants: 0,
      activities: 0,
      foods: 0,
    },
  },
];

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
  // and the total count in one round trip. The reference lookups are added
  // via .addStages() after filter/sort so those stages stay index-eligible.
  const { data: trips, pagination } = await new APIFeatures(
    TripModel,
    filterQuery,
    [],
  )
    .filter(["traveller"])
    .sort()
    .addStages(tripLookupStages)
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
  // 1 : Find the trip by id, scoped to the requester (admins can reach any
  // trip; travellers only their own), pulling in every referenced resource
  // via the same $lookup stages the list endpoint uses
  const matchFilter = ADMIN_ROLES.includes(reqUser.role)
    ? { _id: new Types.ObjectId(id) }
    : { _id: new Types.ObjectId(id), traveller: new Types.ObjectId(reqUser._id) };

  const [trip] = await TripModel.aggregate([
    { $match: matchFilter },
    ...tripLookupStages,
  ]);

  if (!trip) {
    throw new AppError(404, "Trip not found");
  }

  // 2 : Send response
  return { trip };
};

// FUNCTION
// Full replace (PUT): the client sends the complete trip, and this applies
// the exact same validation create does. Every field not present in body is
// wiped rather than left untouched — that's the point of PUT vs PATCH. Only
// _id and traveller survive from the existing document.
const updateTripService = async (
  id: string,
  body: CreateTripBody,
  reqUser: { _id: string; role: string },
) => {
  // 1 : Find the trip to replace, scoped to the requester (admins can reach
  // any trip; travellers only their own)
  const trip = await TripModel.findOne(
    ADMIN_ROLES.includes(reqUser.role)
      ? { _id: id }
      : { _id: id, traveller: reqUser._id },
  );
  if (!trip) {
    throw new AppError(404, "Trip not found");
  }

  // 2 : Verify every submitted reference id actually exists
  await validateTripReferences(body);

  // 3 : Verify each destination/place/activity/food/restaurant belongs to
  // the correct parent submitted alongside it
  await validateTripReferenceParents(body);

  // 4 : Replace the entire document, preserving only its ownership
  trip.overwrite({ ...body, traveller: trip.traveller });
  await trip.save();

  // 5 : Send response
  return { trip };
};

// FUNCTION
const deleteTripService = async (
  id: string,
  reqUser: { _id: string; role: string },
) => {
  // 1 : Find the trip to delete, scoped to the requester (admins can reach
  // any trip; travellers only their own)
  const trip = await TripModel.findOne(
    ADMIN_ROLES.includes(reqUser.role)
      ? { _id: id }
      : { _id: id, traveller: reqUser._id },
  );
  if (!trip) {
    throw new AppError(404, "Trip not found");
  }

  // 2 : Delete the trip
  await trip.deleteOne();

  // 3 : Send response
  return null;
};

export {
  createTripService,
  getTripsService,
  getTripByIdService,
  updateTripService,
  deleteTripService,
};
