import {
  DEFAULT_REGIONS_PAGE,
  DEFAULT_REGIONS_LIMIT,
} from "@src/constants/regionConstant";
import type {
  GetRegionRecommendationsQuery,
  GetRegionsQuery,
} from "@src/types/regionType";

// Each region type is tied to the one interest category that best identifies
// it geographically. foodAndWine and relaxation aren't tied to a specific
// geography type, so they never exclude a region type.
const REGION_TYPE_INTEREST_MAP: Record<
  string,
  keyof GetRegionRecommendationsQuery
> = {
  island: "beachesAndCoasts",
  coastal: "beachesAndCoasts",
  peninsula: "beachesAndCoasts",
  mountainous: "natureAndOutdoors",
  mainland: "historyAndCulture",
  urban: "nightLife",
};

// FUNCTION
// Turns the submitted interest scores into a GetRegionsQuery: any region
// type whose associated interest is 0 is left out of the type filter, so
// e.g. beachesAndCoasts = 0 excludes island, coastal, and peninsula.
const buildRegionRecommendationsQuery = (
  interests: GetRegionRecommendationsQuery,
): GetRegionsQuery => {
  const type = Object.entries(REGION_TYPE_INTEREST_MAP)
    .filter(([, interestKey]) => interests[interestKey] > 0)
    .map(([regionType]) => regionType);

  console.log("type------------------------", type);

  return {
    page: DEFAULT_REGIONS_PAGE,
    limit: DEFAULT_REGIONS_LIMIT,
    sortBy: "createdAt",
    sortOrder: "desc",
    type,
  };
};

export { buildRegionRecommendationsQuery };
