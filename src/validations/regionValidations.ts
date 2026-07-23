import { z } from "zod";
import {
  MIN_REGION_IMAGES,
  DEFAULT_REGIONS_PAGE,
  DEFAULT_REGIONS_LIMIT,
  MAX_REGIONS_LIMIT,
  REGION_SORT_FIELDS,
} from "@src/constants/regionConstants";

const regionTypeEnum = z.enum([
  "island",
  "mainland",
  "mountainous",
  "coastal",
  "peninsula",
  "urban",
]);

const seasonEnum = z.enum(["spring", "summer", "autumn", "winter"]);

const regionStatusEnum = z.enum(["draft", "published", "archived"]);

const faqSchema = z.object({
  question: z.string().trim().min(1),
  answer: z.string().trim().min(1),
});

const createRegionSchema = z.object({
  name: z.string().trim().min(2).max(100),
  tagLine: z.string().trim().min(1).max(150),
  regionType: z.array(regionTypeEnum).min(1),
  bestSeason: z.array(seasonEnum).min(1),
  status: regionStatusEnum.optional(),
  about: z.string().trim().optional(),
  photoGallery: z.array(z.url()).min(MIN_REGION_IMAGES),
  tipsAndTricks: z.array(z.string().trim()).optional(),
  faqs: z.array(faqSchema).optional(),
});

const updateRegionSchema = createRegionSchema.partial();

const getRegionsQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(DEFAULT_REGIONS_PAGE),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_REGIONS_LIMIT)
    .default(DEFAULT_REGIONS_LIMIT),
  sortBy: z.enum(REGION_SORT_FIELDS).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  regionType: regionTypeEnum.optional(),
  bestSeason: seasonEnum.optional(),
  status: regionStatusEnum.optional(),
});

export { createRegionSchema, updateRegionSchema, getRegionsQuerySchema };
