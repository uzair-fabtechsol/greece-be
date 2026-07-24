import type { Db } from "mongodb";

const RENAMES: { collection: string; from: string }[] = [
  { collection: "regions", from: "regionType" },
  { collection: "places", from: "placeType" },
  { collection: "activities", from: "activityType" },
  { collection: "foods", from: "foodType" },
  { collection: "restaurants", from: "restaurantType" },
];

module.exports = {
  async up(db: Db): Promise<void> {
    for (const { collection, from } of RENAMES) {
      await db
        .collection(collection)
        .updateMany(
          { [from]: { $exists: true } },
          { $rename: { [from]: "type" } },
        );
    }
  },

  async down(db: Db): Promise<void> {
    for (const { collection, from } of RENAMES) {
      await db
        .collection(collection)
        .updateMany(
          { type: { $exists: true } },
          { $rename: { type: from } },
        );
    }
  },
};
