import { z } from "zod";
import {
  MIN_RESTAURANT_IMAGES,
  DEFAULT_RESTAURANTS_PAGE,
  DEFAULT_RESTAURANTS_LIMIT,
  MAX_RESTAURANTS_LIMIT,
  RESTAURANT_SORT_FIELDS,
} from "@src/constants/restaurantConstant";
import {
  NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
  TAGLINE_MAX_LENGTH,
} from "@src/constants/limitConstant";
import { csvQueryParam } from "@src/utils/csvQueryParam";

const typeEnum = z.enum([
  "fineDining",
  "casualDining",
  "taverna",
  "cafe",
  "bakery",
  "streetFood",
  "seafood",
  "bar",
  "wineBar",
  "beachBar",
  "fastFood",
  "bistro",
]);

const priceRangeEnum = z.enum(["budget", "midRange", "premium", "luxury"]);

const restaurantStatusEnum = z.enum(["draft", "published", "archived"]);

const createRestaurantSchema = z
  .object({
    name: z.string().trim().min(NAME_MIN_LENGTH).max(NAME_MAX_LENGTH),
    tagLine: z.string().trim().min(1).max(TAGLINE_MAX_LENGTH),
    type: typeEnum,
    priceRange: priceRangeEnum,
    status: restaurantStatusEnum.optional(),
    about: z.string().trim().optional(),
    region: z.string().trim().min(1).optional(),
    destination: z.string().trim().min(1).optional(),
    place: z.string().trim().min(1).optional(),
    photoGallery: z.array(z.url()).min(MIN_RESTAURANT_IMAGES),
    isFeatured: z.boolean().optional(),
    isIndexable: z.boolean().optional(),
  })
  .refine(
    (data) => [data.region, data.destination, data.place].filter(Boolean)
      .length === 1,
    {
      message: "Submit exactly one of region, destination, or place",
      path: ["region"],
    },
  );

const updateRestaurantSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(NAME_MIN_LENGTH)
      .max(NAME_MAX_LENGTH)
      .optional(),
    tagLine: z.string().trim().min(1).max(TAGLINE_MAX_LENGTH).optional(),
    type: typeEnum.optional(),
    priceRange: priceRangeEnum.optional(),
    status: restaurantStatusEnum.optional(),
    about: z.string().trim().optional(),
    region: z.string().trim().min(1).optional(),
    destination: z.string().trim().min(1).optional(),
    place: z.string().trim().min(1).optional(),
    photoGallery: z.array(z.url()).min(MIN_RESTAURANT_IMAGES).optional(),
    isFeatured: z.boolean().optional(),
    isIndexable: z.boolean().optional(),
  })
  .refine(
    (data) => [data.region, data.destination, data.place].filter(Boolean)
      .length <= 1,
    {
      message: "Submit at most one of region, destination, or place",
      path: ["region"],
    },
  );

const updateFeaturedStatusSchema = z.object({
  isFeatured: z.boolean(),
});

const updateIndexableStatusSchema = z.object({
  isIndexable: z.boolean(),
});

const getRestaurantsQuerySchema = z
  .object({
    search: z.string().trim().optional(),
    projection: z.string().trim().optional(),
    page: z.coerce.number().int().min(1).default(DEFAULT_RESTAURANTS_PAGE),
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(MAX_RESTAURANTS_LIMIT)
      .default(DEFAULT_RESTAURANTS_LIMIT),
    sortBy: z.enum(RESTAURANT_SORT_FIELDS).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    type: typeEnum.optional(),
    priceRange: priceRangeEnum.optional(),
    status: restaurantStatusEnum.optional(),
    region: csvQueryParam(z.string().trim().min(1)),
    destination: csvQueryParam(z.string().trim().min(1)),
    place: csvQueryParam(z.string().trim().min(1)),
  })
  .refine(
    (data) =>
      [data.region, data.destination, data.place].filter(Boolean).length <=
      1,
    {
      message: "Submit at most one of region, destination, or place",
      path: ["region"],
    },
  );

export {
  createRestaurantSchema,
  updateRestaurantSchema,
  updateFeaturedStatusSchema,
  updateIndexableStatusSchema,
  getRestaurantsQuerySchema,
};
