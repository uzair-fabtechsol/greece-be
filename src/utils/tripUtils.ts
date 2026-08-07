import type { Model } from "mongoose";
import RegionModel from "@src/models/regionModel";
import DestinationModel from "@src/models/destinationModel";
import PlaceModel from "@src/models/placeModel";
import RestaurantModel from "@src/models/restaurantModel";
import ActivityModel from "@src/models/activityModel";
import FoodModel from "@src/models/foodModel";
import AppError from "@src/utils/appError";
import type { CreateTripBody } from "@src/types/tripType";

const REFERENCE_FIELDS: {
  field: keyof CreateTripBody;
  model: Model<unknown>;
  label: string;
}[] = [
  { field: "regions", model: RegionModel, label: "regions" },
  { field: "destinations", model: DestinationModel, label: "destinations" },
  { field: "places", model: PlaceModel, label: "places" },
  { field: "restaurants", model: RestaurantModel, label: "restaurants" },
  { field: "activities", model: ActivityModel, label: "activities" },
  { field: "foods", model: FoodModel, label: "foods" },
];

// FUNCTION
// Verifies that every id submitted in regions/destinations/places/
// restaurants/activities/foods actually exists, so a trip never ends up
// pointing at a broken reference.
const validateTripReferences = async (
  body: CreateTripBody,
): Promise<void> => {
  await Promise.all(
    REFERENCE_FIELDS.map(async ({ field, model, label }) => {
      const ids = body[field] as string[] | undefined;
      if (!ids || ids.length === 0) {
        return;
      }

      const uniqueIds = [...new Set(ids)];
      const count = await model.countDocuments({
        _id: { $in: uniqueIds },
      });

      if (count !== uniqueIds.length) {
        throw new AppError(404, `One or more ${label} were not found`);
      }
    }),
  );
};

// FUNCTION
// Every destination submitted must belong to one of the submitted regions.
// One query to fetch each destination's region, one Set for O(1) membership
// checks — O(n) overall, not a nested-loop O(n^2) comparison.
const validateDestinationsBelongToRegions = async (
  regions: string[] = [],
  destinations: string[] = [],
): Promise<void> => {
  if (destinations.length === 0) {
    return;
  }

  const regionIdSet = new Set(regions);

  const destinationDocs = await DestinationModel.find({
    _id: { $in: [...new Set(destinations)] },
  })
    .select("region")
    .lean<{ region: { toString(): string } }[]>();

  const hasInvalidDestination = destinationDocs.some(
    (destination) => !regionIdSet.has(destination.region.toString()),
  );

  if (hasInvalidDestination) {
    throw new AppError(
      400,
      "One or more destinations do not belong to the submitted regions",
    );
  }
};

// FUNCTION
// Every place submitted must belong to one of the submitted destinations.
// Same O(n) shape as validateDestinationsBelongToRegions.
const validatePlacesBelongToDestinations = async (
  destinations: string[] = [],
  places: string[] = [],
): Promise<void> => {
  if (places.length === 0) {
    return;
  }

  const destinationIdSet = new Set(destinations);

  const placeDocs = await PlaceModel.find({
    _id: { $in: [...new Set(places)] },
  })
    .select("destination")
    .lean<{ destination: { toString(): string } }[]>();

  const hasInvalidPlace = placeDocs.some(
    (place) => !destinationIdSet.has(place.destination.toString()),
  );

  if (hasInvalidPlace) {
    throw new AppError(
      400,
      "One or more places do not belong to the submitted destinations",
    );
  }
};

interface ParentableDoc {
  region?: { toString(): string } | null;
  destination?: { toString(): string } | null;
  place?: { toString(): string } | null;
}

// FUNCTION
// Activities/foods/restaurants each carry exactly one parent (region,
// destination, or place). Whichever one a resource has must be present in
// the trip's matching submitted array.
const validateSingleParentResources = async (
  model: Model<unknown>,
  resourceIds: string[] = [],
  regions: string[] = [],
  destinations: string[] = [],
  places: string[] = [],
  label: string,
): Promise<void> => {
  if (resourceIds.length === 0) {
    return;
  }

  const regionIdSet = new Set(regions);
  const destinationIdSet = new Set(destinations);
  const placeIdSet = new Set(places);

  const docs = await model
    .find({ _id: { $in: [...new Set(resourceIds)] } })
    .select("region destination place")
    .lean<ParentableDoc[]>();

  const hasInvalidResource = docs.some((doc) => {
    if (doc.region) return !regionIdSet.has(doc.region.toString());
    if (doc.destination) return !destinationIdSet.has(doc.destination.toString());
    if (doc.place) return !placeIdSet.has(doc.place.toString());
    return true;
  });

  if (hasInvalidResource) {
    throw new AppError(
      400,
      `One or more ${label} do not belong to the submitted regions, destinations, or places`,
    );
  }
};

// FUNCTION
// Runs every parent-hierarchy check for a trip's reference arrays. Only
// checks the fields actually present in the body, so a partial update that
// doesn't touch, say, destinations/places, skips that pair's validation.
const validateTripReferenceParents = async (
  body: CreateTripBody,
): Promise<void> => {
  await validateDestinationsBelongToRegions(body.regions, body.destinations);
  await validatePlacesBelongToDestinations(body.destinations, body.places);
  await Promise.all([
    validateSingleParentResources(
      ActivityModel,
      body.activities,
      body.regions,
      body.destinations,
      body.places,
      "activities",
    ),
    validateSingleParentResources(
      FoodModel,
      body.foods,
      body.regions,
      body.destinations,
      body.places,
      "foods",
    ),
    validateSingleParentResources(
      RestaurantModel,
      body.restaurants,
      body.regions,
      body.destinations,
      body.places,
      "restaurants",
    ),
  ]);
};

export {
  validateTripReferences,
  validateDestinationsBelongToRegions,
  validatePlacesBelongToDestinations,
  validateSingleParentResources,
  validateTripReferenceParents,
};
