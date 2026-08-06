import { z } from "zod";
import {
  MIN_REGION_IMAGES,
  MAX_TIPS_AND_TRICKS,
  DEFAULT_REGIONS_PAGE,
  DEFAULT_REGIONS_LIMIT,
  MAX_REGIONS_LIMIT,
  REGION_SORT_FIELDS,
} from "@src/constants/regionConstant";
import {
  NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
  TAGLINE_MAX_LENGTH,
} from "@src/constants/limitConstant";

const typeEnum = z.enum([
  "island",
  "mainland",
  "mountainous",
  "coastal",
  "peninsula",
  "urban",
]);

const seasonEnum = z.enum(["spring", "summer", "autumn", "winter"]);

const regionStatusEnum = z.enum(["draft", "published", "archived"]);

const faqSchema = z
  .object({
    question: z.string().trim().min(1),
    answer: z.string().trim().min(1),
  })
  .strict();

const createRegionSchema = z
  .object({
    name: z.string().trim().min(NAME_MIN_LENGTH).max(NAME_MAX_LENGTH),
    tagLine: z.string().trim().min(1).max(TAGLINE_MAX_LENGTH),
    type: z.array(typeEnum).min(1),
    bestSeason: z.array(seasonEnum).min(1),
    status: regionStatusEnum.optional(),
    about: z.string().trim().optional(),
    photoGallery: z.array(z.url()).min(MIN_REGION_IMAGES),
    tipsAndTricks: z
      .array(z.string().trim())
      .max(MAX_TIPS_AND_TRICKS)
      .optional(),
    faqs: z.array(faqSchema).optional(),
  })
  .strict();

const updateRegionSchema = createRegionSchema.partial();

const getRegionsQuerySchema = z
  .object({
    search: z.string().trim().optional(),
    projection: z.string().trim().optional(),
    page: z.coerce.number().int().min(1).default(DEFAULT_REGIONS_PAGE),
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(MAX_REGIONS_LIMIT)
      .default(DEFAULT_REGIONS_LIMIT),
    sortBy: z.enum(REGION_SORT_FIELDS).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    // Comma-separated list of types (e.g. "island,mainland") so a single
    // filter can express multiple types, not just one.
    type: z
      .string()
      .trim()
      .transform((value) =>
        value
          .split(",")
          .map((type) => type.trim())
          .filter(Boolean),
      )
      .pipe(z.array(typeEnum).min(1))
      .optional(),
    bestSeason: seasonEnum.optional(),
    status: regionStatusEnum.optional(),
  })
  .strict();

const interestScore = z.coerce.number().min(0).max(100).default(0);

const getRegionRecommendationsQuerySchema = z
  .object({
    historyAndCulture: interestScore,
    beachesAndCoasts: interestScore,
    foodAndWine: interestScore,
    natureAndOutdoors: interestScore,
    nightLife: interestScore,
    relaxation: interestScore,
  })
  .strict();

export {
  createRegionSchema,
  updateRegionSchema,
  getRegionsQuerySchema,
  getRegionRecommendationsQuerySchema,
};
