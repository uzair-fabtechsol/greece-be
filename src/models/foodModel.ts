import { model, models, Schema, type InferSchemaType } from "mongoose";
import { Status } from "@src/constants/enumConstants";
import {
  MIN_FOOD_IMAGES,
  MAX_FOOD_IMAGES,
} from "@src/constants/foodConstants";
import {
  NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
  TAGLINE_MAX_LENGTH,
} from "@src/constants/limitConstants";

enum FoodType {
  LocalDish = "localDish",
  Meze = "meze",
  StreetFood = "streetFood",
  Seafood = "seafood",
  Dessert = "dessert",
  Bakery = "bakery",
  Cheese = "cheese",
  OliveOil = "oliveOil",
  Wine = "wine",
  Ouzo = "ouzo",
  Taverna = "taverna",
}

const foodSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: NAME_MIN_LENGTH,
      maxlength: NAME_MAX_LENGTH,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    tagLine: {
      type: String,
      required: true,
      trim: true,
      maxlength: TAGLINE_MAX_LENGTH,
    },
    type: {
      type: String,
      enum: Object.values(FoodType),
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
      required: true,
      default: [],
      validate: {
        validator: (value: string[]) =>
          value.length >= MIN_FOOD_IMAGES && value.length <= MAX_FOOD_IMAGES,
        message: `At least ${MIN_FOOD_IMAGES} and at most ${MAX_FOOD_IMAGES} photos are required`,
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

type FoodDocType = InferSchemaType<typeof foodSchema>;

const FoodModel = models.Food || model<FoodDocType>("Food", foodSchema);

export default FoodModel;
export type { FoodDocType };
export { FoodType };
