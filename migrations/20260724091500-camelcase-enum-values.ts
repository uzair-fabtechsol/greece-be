import type { Db } from "mongodb";

type FieldRenames = { collection: string; field: string; map: Record<string, string> };

const DESTINATION_TYPE = {
  "coastal-town": "coastalTown",
  "mountain-village": "mountainVillage",
};

const PLACE_TYPE = {
  "archaeological-site": "archaeologicalSite",
  "nature-reserve": "natureReserve",
};

const ACTIVITY_TYPE = {
  "scuba-diving": "scubaDiving",
  "wine-tasting": "wineTasting",
  "cooking-class": "cookingClass",
  "cultural-tour": "culturalTour",
  "photography-tour": "photographyTour",
  "horseback-riding": "horsebackRiding",
  "rock-climbing": "rockClimbing",
};

const FOOD_TYPE = {
  "local-dish": "localDish",
  "street-food": "streetFood",
  "olive-oil": "oliveOil",
};

const RESTAURANT_TYPE = {
  "fine-dining": "fineDining",
  "casual-dining": "casualDining",
  "street-food": "streetFood",
  "wine-bar": "wineBar",
  "beach-bar": "beachBar",
  "fast-food": "fastFood",
};

const RESTAURANT_PRICE_RANGE = {
  "mid-range": "midRange",
};

const RENAMES: FieldRenames[] = [
  { collection: "destinations", field: "type", map: DESTINATION_TYPE },
  { collection: "places", field: "type", map: PLACE_TYPE },
  { collection: "activities", field: "type", map: ACTIVITY_TYPE },
  { collection: "foods", field: "type", map: FOOD_TYPE },
  { collection: "restaurants", field: "type", map: RESTAURANT_TYPE },
  {
    collection: "restaurants",
    field: "priceRange",
    map: RESTAURANT_PRICE_RANGE,
  },
];

module.exports = {
  async up(db: Db): Promise<void> {
    for (const { collection, field, map } of RENAMES) {
      for (const [from, to] of Object.entries(map)) {
        await db
          .collection(collection)
          .updateMany({ [field]: from }, { $set: { [field]: to } });
      }
    }
  },

  async down(db: Db): Promise<void> {
    for (const { collection, field, map } of RENAMES) {
      for (const [from, to] of Object.entries(map)) {
        await db
          .collection(collection)
          .updateMany({ [field]: to }, { $set: { [field]: from } });
      }
    }
  },
};
