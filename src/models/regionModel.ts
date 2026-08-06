import { model, models, Schema, type InferSchemaType } from "mongoose";
import { Season, Status } from "@src/constants/enumConstant";
import {
  MIN_REGION_IMAGES,
  MAX_REGION_IMAGES,
  MAX_TIPS_AND_TRICKS,
} from "@src/constants/regionConstant";
import {
  NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
  TAGLINE_MAX_LENGTH,
} from "@src/constants/limitConstant";

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
      required: true,
      default: [],
      validate: {
        validator: (value: string[]) =>
          value.length >= MIN_REGION_IMAGES &&
          value.length <= MAX_REGION_IMAGES,
        message: `At least ${MIN_REGION_IMAGES} and at most ${MAX_REGION_IMAGES} photos are required`,
      },
    },
    tipsAndTricks: {
      type: [String],
      default: [],
      validate: {
        validator: (value: string[]) => value.length <= MAX_TIPS_AND_TRICKS,
        message: `At most ${MAX_TIPS_AND_TRICKS} tips and tricks are allowed`,
      },
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

regionSchema.index({ status: 1, type: 1 });
regionSchema.index({ status: 1, bestSeason: 1 });
regionSchema.index({ createdAt: -1 });

type RegionDocType = InferSchemaType<typeof regionSchema>;

const RegionModel =
  models.Region || model<RegionDocType>("Region", regionSchema);

export default RegionModel;
export type { RegionDocType };
