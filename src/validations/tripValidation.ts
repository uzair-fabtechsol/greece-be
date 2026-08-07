import { z } from "zod";
import {
  MIN_ADULTS,
  MAX_ADULTS,
  MIN_CHILDREN,
  MAX_CHILDREN,
  MAX_TRAVELLER_NAMES,
  MIN_INTEREST_SCORE,
  MAX_INTEREST_SCORE,
  DEFAULT_TRIPS_PAGE,
  DEFAULT_TRIPS_LIMIT,
  MAX_TRIPS_LIMIT,
  TRIP_SORT_FIELDS,
} from "@src/constants/tripConstant";
import {
  GroupType,
  TravelPace,
  DailySchedule,
  MobilityLevel,
} from "@src/models/tripModel";

const groupTypeEnum = z.enum(Object.values(GroupType) as [string, ...string[]]);
const travelPaceEnum = z.enum(
  Object.values(TravelPace) as [string, ...string[]],
);
const dailyScheduleEnum = z.enum(
  Object.values(DailySchedule) as [string, ...string[]],
);
const mobilityLevelEnum = z.enum(
  Object.values(MobilityLevel) as [string, ...string[]],
);

const interestScore = z
  .number()
  .min(MIN_INTEREST_SCORE)
  .max(MAX_INTEREST_SCORE);

const interestsSchema = z
  .object({
    historyAndCulture: interestScore,
    beachesAndCoasts: interestScore,
    foodAndWine: interestScore,
    natureAndOutdoors: interestScore,
    nightLife: interestScore,
    relaxation: interestScore,
  })
  .strict();

const refId = z.string().trim().min(1);

// FUNCTION
// travellerNames is optional, but if any are submitted their count must
// match the total number of travellers.
const travellerNamesMatchHeadcount = (data: {
  adults: number;
  children?: number;
  travellerNames?: string[];
}) => {
  const travellerCount = data.travellerNames?.length ?? 0;
  return (
    travellerCount === 0 ||
    travellerCount === data.adults + (data.children ?? 0)
  );
};

const createTripSchema = z
  .object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    adults: z.number().int().min(MIN_ADULTS).max(MAX_ADULTS),
    children: z.number().int().min(MIN_CHILDREN).max(MAX_CHILDREN).optional(),
    groupType: groupTypeEnum,
    travellerNames: z
      .array(z.string().trim().min(1))
      .max(MAX_TRAVELLER_NAMES)
      .optional(),
    travelPace: travelPaceEnum,
    interests: interestsSchema,
    dailySchedule: dailyScheduleEnum,
    mobilityLevel: mobilityLevelEnum,
    regions: z.array(refId).min(1),
    destinations: z.array(refId).optional(),
    places: z.array(refId).optional(),
    restaurants: z.array(refId).optional(),
    activities: z.array(refId).optional(),
    foods: z.array(refId).optional(),
  })
  .strict()
  .refine((data) => data.endDate > data.startDate, {
    message: "endDate must be after startDate",
    path: ["endDate"],
  })
  .refine(travellerNamesMatchHeadcount, {
    message: "travellerNames length must match adults + children",
    path: ["travellerNames"],
  });

const getTripsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(DEFAULT_TRIPS_PAGE),
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(MAX_TRIPS_LIMIT)
      .default(DEFAULT_TRIPS_LIMIT),
    sortBy: z.enum(TRIP_SORT_FIELDS).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    // Admin-only: filter trips down to a specific traveller's. Ignored for
    // non-admin callers, who are always scoped to their own trips.
    traveller: z.string().trim().min(1).optional(),
  })
  .strict();

export { createTripSchema, getTripsQuerySchema };
