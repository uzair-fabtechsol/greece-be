import type { Model } from "mongoose";
import RegionModel from "@src/models/regionModel";
import DestinationModel from "@src/models/destinationModel";
import PlaceModel from "@src/models/placeModel";
import RestaurantModel from "@src/models/restaurantModel";
import ActivityModel from "@src/models/activityModel";
import FoodModel from "@src/models/foodModel";
import AppError from "@src/utils/appError";
import type { CreateTripBody, UpdateTripBody } from "@src/types/tripType";

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
  body: CreateTripBody | UpdateTripBody,
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

export { validateTripReferences };
