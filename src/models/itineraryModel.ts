import { model, models, Schema, type InferSchemaType } from "mongoose";
import {
  MIN_DAY_NUMBER,
  MAX_DAY_NUMBER,
} from "@src/constants/itineraryConstant";

enum ItineraryStatus {
  Draft = "draft",
  Complete = "complete",
}

enum DaySlotName {
  EarlyMorning = "earlyMorning",
  Morning = "morning",
  Afternoon = "afternoon",
  Evening = "evening",
  Night = "night",
}

const slotSchema = {
  destinations: {
    type: [{ type: Schema.Types.ObjectId, ref: "Destination" }],
    default: [],
  },
  places: {
    type: [{ type: Schema.Types.ObjectId, ref: "Place" }],
    default: [],
  },
  restaurants: {
    type: [{ type: Schema.Types.ObjectId, ref: "Restaurant" }],
    default: [],
  },
  foods: {
    type: [{ type: Schema.Types.ObjectId, ref: "Food" }],
    default: [],
  },
  activities: {
    type: [{ type: Schema.Types.ObjectId, ref: "Activity" }],
    default: [],
  },
};

const daySchema = {
  dayNumber: {
    type: Number,
    required: true,
    min: MIN_DAY_NUMBER,
    max: MAX_DAY_NUMBER,
  },
  date: {
    type: Date,
    required: true,
  },
  region: {
    type: Schema.Types.ObjectId,
    ref: "Region",
    required: true,
  },
  slots: {
    earlyMorning: slotSchema,
    morning: slotSchema,
    afternoon: slotSchema,
    evening: slotSchema,
    night: slotSchema,
  },
};

const itinerarySchema = new Schema(
  {
    trip: {
      type: Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
      unique: true,
    },
    traveller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastUpdatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ItineraryStatus),
      default: ItineraryStatus.Draft,
    },
    days: {
      type: [daySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

itinerarySchema.index({ traveller: 1, createdAt: -1 });
itinerarySchema.index({ status: 1 });

type ItineraryDocType = InferSchemaType<typeof itinerarySchema>;

const ItineraryModel =
  models.Itinerary || model<ItineraryDocType>("Itinerary", itinerarySchema);

export default ItineraryModel;
export type { ItineraryDocType };
export { ItineraryStatus, DaySlotName };
