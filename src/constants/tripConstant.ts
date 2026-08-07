export const MIN_ADULTS = 1;
export const MAX_ADULTS = 20;

export const MIN_CHILDREN = 0;
export const MAX_CHILDREN = 20;

export const MAX_TRAVELLER_NAMES = MAX_ADULTS + MAX_CHILDREN;

export const MIN_INTEREST_SCORE = 0;
export const MAX_INTEREST_SCORE = 100;

export const DEFAULT_TRIPS_PAGE = 1;
export const DEFAULT_TRIPS_LIMIT = 10;
export const MAX_TRIPS_LIMIT = 50;

export const TRIP_SORT_FIELDS = [
  "startDate",
  "createdAt",
  "updatedAt",
] as const;
