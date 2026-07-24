import { model, models, Schema, type InferSchemaType } from "mongoose";
import { Status } from "@src/constants/enumConstants";

enum FoodType {
  LocalDish = "local-dish",
  Meze = "meze",
  StreetFood = "street-food",
  Seafood = "seafood",
  Dessert = "dessert",
  Bakery = "bakery",
  Cheese = "cheese",
  OliveOil = "olive-oil",
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
    tagLine: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    foodType: {
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

type FoodDocType = InferSchemaType<typeof foodSchema>;

const FoodModel = models.Food || model<FoodDocType>("Food", foodSchema);

export default FoodModel;
export type { FoodDocType };
export { FoodType };
