import { z } from "zod";
import {
  MIN_PLACE_IMAGES,
  MAX_HERITAGE_ENTRIES,
  MAX_SUSTAINABILITY_NOTES,
  DEFAULT_PLACES_PAGE,
  DEFAULT_PLACES_LIMIT,
  MAX_PLACES_LIMIT,
  PLACE_SORT_FIELDS,
} from "@src/constants/placeConstants";

const placeTypeEnum = z.enum([
  "beach",
  "viewpoint",
  "landmark",
  "village",
  "archaeological-site",
  "museum",
  "monastery",
  "church",
  "gorge",
  "cave",
  "nature-reserve",
  "mountain",
  "lake",
  "waterfall",
  "harbor",
  "market",
]);

const placeStatusEnum = z.enum(["draft", "published", "archived"]);

const heritageSchema = z.object({
  image: z.url(),
  historicalFact: z.string().trim().min(1),
});

const createPlaceSchema = z.object({
  destination: z.string().trim().min(1),
  name: z.string().trim().min(2).max(100),
  tagLine: z.string().trim().min(1).max(150),
  placeType: placeTypeEnum,
  status: placeStatusEnum.optional(),
  about: z.string().trim().optional(),
  heritage: z.array(heritageSchema).max(MAX_HERITAGE_ENTRIES).optional(),
  sustainabilityNotes: z
    .array(z.string().trim())
    .max(MAX_SUSTAINABILITY_NOTES)
    .optional(),
  photoGallery: z.array(z.url()).min(MIN_PLACE_IMAGES),
  tipsAndTricks: z.array(z.string().trim()).optional(),
});

const updatePlaceSchema = createPlaceSchema.partial();

const getPlacesQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(DEFAULT_PLACES_PAGE),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_PLACES_LIMIT)
    .default(DEFAULT_PLACES_LIMIT),
  sortBy: z.enum(PLACE_SORT_FIELDS).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  placeType: placeTypeEnum.optional(),
  status: placeStatusEnum.optional(),
  destination: z.string().trim().optional(),
});

export {
  createPlaceSchema,
  updatePlaceSchema,
  getPlacesQuerySchema,
};
