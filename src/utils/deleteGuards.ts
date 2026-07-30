import ActivityModel from "@src/models/activityModel";
import FoodModel from "@src/models/foodModel";
import RestaurantModel from "@src/models/restaurantModel";
import AppError from "@src/utils/appError";

// FUNCTION
// Activities, foods and restaurants can each hang off a region, a destination
// or a place, so before deleting any of the three we make sure none of them
// still points at it. Throws with the names of whatever is still linked.
export const assertNoLinkedContent = async (
  referenceField: "region" | "destination" | "place",
  id: string,
) => {
  // 1 : Check each collection that can reference this resource
  const [hasActivities, hasFoods, hasRestaurants] = await Promise.all([
    ActivityModel.exists({ [referenceField]: id }),
    FoodModel.exists({ [referenceField]: id }),
    RestaurantModel.exists({ [referenceField]: id }),
  ]);

  // 2 : Collect the ones that are blocking the delete
  const linked: string[] = [];
  if (hasActivities) linked.push("activities");
  if (hasFoods) linked.push("foods");
  if (hasRestaurants) linked.push("restaurants");

  // 3 : Block the delete if anything is still linked
  if (linked.length > 0) {
    throw new AppError(
      400,
      `Cannot delete a ${referenceField} that has ${linked.join(", ")} linked to it. Delete or reassign them first.`,
    );
  }
};
