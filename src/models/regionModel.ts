import { model, models, Schema, type InferSchemaType } from "mongoose";

enum RegionType {
  Island = "island",
  Mainland = "mainland",
  Mountainous = "mountainous",
  Coastal = "coastal",
  Peninsula = "peninsula",
  Urban = "urban",
}

enum Season {
  Spring = "spring",
  Summer = "summer",
  Autumn = "autumn",
  Winter = "winter",
}

enum RegionStatus {
  Draft = "draft",
  Published = "published",
  Archived = "archived",
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
      trim: true,
      maxlength: 150,
    },
    regionType: {
      type: [String],
      enum: Object.values(RegionType),
      default: [],
    },
    bestSeason: {
      type: [String],
      enum: Object.values(Season),
      default: [],
    },
    status: {
      type: String,
      enum: Object.values(RegionStatus),
      default: RegionStatus.Draft,
    },
    about: {
      type: String,
      trim: true,
    },
    photoGallery: {
      type: [String],
      default: [],
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
