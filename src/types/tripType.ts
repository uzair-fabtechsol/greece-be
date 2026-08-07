interface InterestsBody {
  historyAndCulture: number;
  beachesAndCoasts: number;
  foodAndWine: number;
  natureAndOutdoors: number;
  nightLife: number;
  relaxation: number;
}

interface CreateTripBody {
  startDate: Date;
  endDate: Date;
  adults: number;
  children?: number;
  groupType: string;
  travellerNames?: string[];
  travelPace: string;
  interests: InterestsBody;
  dailySchedule: string;
  mobilityLevel: string;
  regions?: string[];
  destinations?: string[];
  places?: string[];
  restaurants?: string[];
  activities?: string[];
  foods?: string[];
}

type UpdateTripBody = Partial<CreateTripBody>;

interface GetTripsQuery {
  page: number;
  limit: number;
  sortBy: "startDate" | "createdAt" | "updatedAt";
  sortOrder: "asc" | "desc";
  user?: string;
}

export type {
  InterestsBody,
  CreateTripBody,
  UpdateTripBody,
  GetTripsQuery,
};
