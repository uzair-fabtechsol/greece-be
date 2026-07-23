import { model, models, Schema, type InferSchemaType } from "mongoose";
import { Season, Status } from "@src/constants/enumConstants";

enum RegionType {
  Island = "island",
  Mainland = "mainland",
  Mountainous = "mountainous",
  Coastal = "coastal",
  Peninsula = "peninsula",
  Urban = "urban",
}

const regionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    tagLine: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    regionType: {
      type: [String],
      enum: Object.values(RegionType),
      validate: {
        validator: (value: string[]) => value.length >= 1,
        message: "At least 1 region type is required",
      },
    },
    bestSeason: {
      type: [String],
      enum: Object.values(Season),
      validate: {
        validator: (value: string[]) => value.length >= 1,
        message: "At least 1 best season is required",
      },
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
    photoGallery: {
      type: [String],
      validate: {
        validator: (value: string[]) => value.length >= 5,
        message: "At least 5 photos are required",
      },
    },
    tipsAndTricks: {
      type: [String],
      default: [],
    },
    faqs: {
      type: [
        {
          question: {
            type: String,
            required: true,
            trim: true,
          },
          answer: {
            type: String,
            required: true,
            trim: true,
          },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

type RegionDocType = InferSchemaType<typeof regionSchema>;

const RegionModel =
  models.Region || model<RegionDocType>("Region", regionSchema);

export default RegionModel;
export type { RegionDocType };
