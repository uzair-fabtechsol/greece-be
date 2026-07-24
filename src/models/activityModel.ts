import { model, models, Schema, type InferSchemaType } from "mongoose";
import { Status } from "@src/constants/enumConstants";
import {
  MIN_ACTIVITY_IMAGES,
  MAX_ACTIVITY_IMAGES,
  MAX_HIGHLIGHTS,
  MAX_WHATS_INCLUDED,
  MAX_WHAT_TO_EXPECT,
  MAX_GOOD_TO_KNOW,
} from "@src/constants/activityConstants";

enum ActivityType {
  Boating = "boating",
  Hiking = "hiking",
  ScubaDiving = "scubaDiving",
  Snorkeling = "snorkeling",
  Sailing = "sailing",
  Kayaking = "kayaking",
  Windsurfing = "windsurfing",
  Paragliding = "paragliding",
  WineTasting = "wineTasting",
  CookingClass = "cookingClass",
  CulturalTour = "culturalTour",
  PhotographyTour = "photographyTour",
  HorsebackRiding = "horsebackRiding",
  Cycling = "cycling",
  RockClimbing = "rockClimbing",
  Fishing = "fishing",
}

const activitySchema = new Schema(
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
    type: {
      type: String,
      enum: Object.values(ActivityType),
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
    highlights: {
      type: [String],
      default: [],
      validate: {
        validator: (value: string[]) => value.length <= MAX_HIGHLIGHTS,
        message: `At most ${MAX_HIGHLIGHTS} highlights are allowed`,
      },
    },
    whatsIncluded: {
      type: [String],
      default: [],
      validate: {
        validator: (value: string[]) => value.length <= MAX_WHATS_INCLUDED,
        message: `At most ${MAX_WHATS_INCLUDED} items are allowed`,
      },
    },
    whatToExpect: {
      type: [String],
      default: [],
      validate: {
        validator: (value: string[]) => value.length <= MAX_WHAT_TO_EXPECT,
        message: `At most ${MAX_WHAT_TO_EXPECT} items are allowed`,
      },
    },
    goodToKnow: {
      type: [String],
      default: [],
      validate: {
        validator: (value: string[]) => value.length <= MAX_GOOD_TO_KNOW,
        message: `At most ${MAX_GOOD_TO_KNOW} items are allowed`,
      },
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
          value.length >= MIN_ACTIVITY_IMAGES &&
          value.length <= MAX_ACTIVITY_IMAGES,
        message: `At least ${MIN_ACTIVITY_IMAGES} and at most ${MAX_ACTIVITY_IMAGES} photos are required`,
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

type ActivityDocType = InferSchemaType<typeof activitySchema>;

const ActivityModel =
  models.Activity || model<ActivityDocType>("Activity", activitySchema);

export default ActivityModel;
export type { ActivityDocType };
export { ActivityType };
