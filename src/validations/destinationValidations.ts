import { z } from "zod";
import {
  MIN_DESTINATION_IMAGES,
  DEFAULT_DESTINATIONS_PAGE,
  DEFAULT_DESTINATIONS_LIMIT,
  MAX_DESTINATIONS_LIMIT,
  DESTINATION_SORT_FIELDS,
} from "@src/constants/destinationConstants";

const destinationTypeEnum = z.enum([
  "island",
  "city",
  "town",
  "village",
  "coastal-town",
  "mountain-village",
  "archipelago",
]);

const seasonEnum = z.enum(["spring", "summer", "autumn", "winter"]);

const destinationStatusEnum = z.enum(["draft", "published", "archived"]);

const quickFactsSchema = z.object({
  country: z.string().trim().min(1),
  language: z.string().trim().min(1),
  currency: z.object({
    currencyName: z.string().trim().min(1),
    currencySign: z.string().trim().min(1),
  }),
  timeZone: z.string().trim().min(1),
  bestSeason: z.array(seasonEnum).min(1),
});

const createDestinationSchema = z.object({
  region: z.string().trim().min(1),
  name: z.string().trim().min(2).max(100),
  type: destinationTypeEnum,
  status: destinationStatusEnum.optional(),
  quickFacts: quickFactsSchema,
  about: z.string().trim().optional(),
  photoGallery: z.array(z.url()).min(MIN_DESTINATION_IMAGES),
});

const updateDestinationSchema = createDestinationSchema.partial();

const getDestinationsQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(DEFAULT_DESTINATIONS_PAGE),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_DESTINATIONS_LIMIT)
    .default(DEFAULT_DESTINATIONS_LIMIT),
  sortBy: z.enum(DESTINATION_SORT_FIELDS).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  type: destinationTypeEnum.optional(),
  status: destinationStatusEnum.optional(),
  bestSeason: seasonEnum.optional(),
  region: z.string().trim().optional(),
});

export {
  createDestinationSchema,
  updateDestinationSchema,
  getDestinationsQuerySchema,
};
