export const MIN_DAY_NUMBER = 1;
// Sanity upper bound only — the real per-trip max is (endDate - startDate),
// enforced at the service layer against the parent Trip.
export const MAX_DAY_NUMBER = 90;
