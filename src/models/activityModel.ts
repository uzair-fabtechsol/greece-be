import { model, models, Schema, type InferSchemaType } from "mongoose";
import { Status } from "@src/constants/enumConstants";

enum ActivityType {
  Boating = "boating",
  Hiking = "hiking",
  ScubaDiving = "scuba-diving",
  Snorkeling = "snorkeling",
  Sailing = "sailing",
  Kayaking = "kayaking",
  Windsurfing = "windsurfing",
  Paragliding = "paragliding",
  WineTasting = "wine-tasting",
  CookingClass = "cooking-class",
  CulturalTour = "cultural-tour",
  PhotographyTour = "photography-tour",
  HorsebackRiding = "horseback-riding",
  Cycling = "cycling",
  RockClimbing = "rock-climbing",
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
    activityType: {
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
        validator: (value: string[]) => value.length <= 5,
        message: "At most 5 highlights are allowed",
      },
    },
    whatsIncluded: {
      type: [String],
      default: [],
      validate: {
        validator: (value: string[]) => value.length <= 5,
        message: "At most 5 items are allowed",
      },
    },
    whatToExpect: {
      type: [String],
      default: [],
      validate: {
        validator: (value: string[]) => value.length <= 5,
        message: "At most 5 items are allowed",
      },
    },
    goodToKnow: {
      type: [String],
      default: [],
      validate: {
        validator: (value: string[]) => value.length <= 5,
        message: "At most 5 items are allowed",
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
        validator: (value: string[]) => value.length >= 5,
        message: "At least 5 photos are required",
      },
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
