import { model, models, Schema, type InferSchemaType } from "mongoose";
import { Status } from "@src/constants/enumConstants";
import {
  MIN_RESTAURANT_IMAGES,
  MAX_RESTAURANT_IMAGES,
} from "@src/constants/restaurantConstants";

enum RestaurantType {
  FineDining = "fineDining",
  CasualDining = "casualDining",
  Taverna = "taverna",
  Cafe = "cafe",
  Bakery = "bakery",
  StreetFood = "streetFood",
  Seafood = "seafood",
  Bar = "bar",
  WineBar = "wineBar",
  BeachBar = "beachBar",
  FastFood = "fastFood",
  Bistro = "bistro",
}

enum PriceRange {
  Budget = "budget",
  MidRange = "midRange",
  Premium = "premium",
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
    type: {
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
        validator: (value: string[]) =>
          value.length >= MIN_RESTAURANT_IMAGES &&
          value.length <= MAX_RESTAURANT_IMAGES,
        message: `At least ${MIN_RESTAURANT_IMAGES} and at most ${MAX_RESTAURANT_IMAGES} photos are required`,
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
