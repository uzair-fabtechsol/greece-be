import { model, models, Schema, type InferSchemaType } from "mongoose";
import {
  MIN_ADULTS,
  MAX_ADULTS,
  MIN_CHILDREN,
  MAX_CHILDREN,
  MAX_TRAVELLER_NAMES,
  MIN_INTEREST_SCORE,
  MAX_INTEREST_SCORE,
} from "@src/constants/tripConstant";

enum GroupType {
  Solo = "solo",
  Couple = "couple",
  Family = "family",
  Friends = "friends",
}

enum TravelPace {
  Relaxed = "relaxed",
  Moderate = "moderate",
  Intensive = "intensive",
}

enum DailySchedule {
  EarlyBird = "earlyBird",
  Balanced = "balanced",
  NightOwl = "nightOwl",
}

enum MobilityLevel {
  Low = "low",
  Moderate = "moderate",
  High = "high",
}

// TODO: revisit itinerary/status once the Itinerary model and generation
// flow are built.
// enum TripStatus {
//   ItineraryPending = "itineraryPending",
//   ItineraryGenerated = "itineraryGenerated",
//   ItineraryFailed = "itineraryFailed",
// }

const interestScoreField = {
  type: Number,
  required: true,
  min: MIN_INTEREST_SCORE,
  max: MAX_INTEREST_SCORE,
};

const tripSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (this: { startDate: Date }, value: Date) {
          return value > this.startDate;
        },
        message: "endDate must be after startDate",
      },
    },
    adults: {
      type: Number,
      required: true,
      min: MIN_ADULTS,
      max: MAX_ADULTS,
    },
    children: {
      type: Number,
      default: 0,
      min: MIN_CHILDREN,
      max: MAX_CHILDREN,
    },
    groupType: {
      type: String,
      enum: Object.values(GroupType),
      required: true,
    },
    travellerNames: {
      type: [String],
      default: [],
      validate: {
        validator: (value: string[]) => value.length <= MAX_TRAVELLER_NAMES,
        message: `At most ${MAX_TRAVELLER_NAMES} traveller names are allowed`,
      },
    },
    travelPace: {
      type: String,
      enum: Object.values(TravelPace),
      required: true,
    },
    interests: {
      historyAndCulture: interestScoreField,
      beachesAndCoasts: interestScoreField,
      foodAndWine: interestScoreField,
      natureAndOutdoors: interestScoreField,
      nightLife: interestScoreField,
      relaxation: interestScoreField,
    },
    dailySchedule: {
      type: String,
      enum: Object.values(DailySchedule),
      required: true,
    },
    mobilityLevel: {
      type: String,
      enum: Object.values(MobilityLevel),
      required: true,
    },
    regions: {
      type: [{ type: Schema.Types.ObjectId, ref: "Region" }],
      default: [],
    },
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
    activities: {
      type: [{ type: Schema.Types.ObjectId, ref: "Activity" }],
      default: [],
    },
    foods: {
      type: [{ type: Schema.Types.ObjectId, ref: "Food" }],
      default: [],
    },
    // itinerary: {
    //   type: Schema.Types.ObjectId,
    //   ref: "Itinerary",
    //   default: null,
    // },
    // status: {
    //   type: String,
    //   enum: Object.values(TripStatus),
    //   default: TripStatus.ItineraryPending,
    // },
  },
  {
    timestamps: true,
  },
);

tripSchema.index({ user: 1, createdAt: -1 });
// tripSchema.index({ status: 1 });

type TripDocType = InferSchemaType<typeof tripSchema>;

const TripModel = models.Trip || model<TripDocType>("Trip", tripSchema);

export default TripModel;
export type { TripDocType };
export { GroupType, TravelPace, DailySchedule, MobilityLevel };
