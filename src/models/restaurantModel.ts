import { model, models, Schema, type InferSchemaType } from "mongoose";
import { Status } from "@src/constants/enumConstants";

enum RestaurantType {
  FineDining = "fine-dining",
  CasualDining = "casual-dining",
  Taverna = "taverna",
  Cafe = "cafe",
  Bakery = "bakery",
  StreetFood = "street-food",
  Seafood = "seafood",
  Bar = "bar",
  WineBar = "wine-bar",
  BeachBar = "beach-bar",
  FastFood = "fast-food",
  Bistro = "bistro",
}

enum PriceRange {
  Budget = "budget",
  MidRange = "mid-range",
  FineDining = "fine-dining",
  Luxury = "luxury",
}

const restaurantSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    restaurantType: {
      type: String,
      enum: Object.values(RestaurantType),
      required: true,
    },
    priceRange: {
      type: String,
      enum: Object.values(PriceRange),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(Status),
      default: Status.Draft,
    },
    about: {
      type: String,
      trim: true,
    },
    region: {
      type: Schema.Types.ObjectId,
      ref: "Region",
      default: null,
    },
    destination: {
      type: Schema.Types.ObjectId,
      ref: "Destination",
      default: null,
    },
    place: {
      type: Schema.Types.ObjectId,
      ref: "Place",
      default: null,
    },
    photoGallery: {
      type: [String],
      validate: {
        validator: (value: string[]) => value.length >= 5,
        message: "At least 5 photos are required",
      },
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isIndexable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

type RestaurantDocType = InferSchemaType<typeof restaurantSchema>;

const RestaurantModel =
  models.Restaurant ||
  model<RestaurantDocType>("Restaurant", restaurantSchema);

export default RestaurantModel;
export type { RestaurantDocType };
export { RestaurantType, PriceRange };
