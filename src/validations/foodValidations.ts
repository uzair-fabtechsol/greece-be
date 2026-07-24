import { z } from "zod";
import {
  MIN_FOOD_IMAGES,
  DEFAULT_FOODS_PAGE,
  DEFAULT_FOODS_LIMIT,
  MAX_FOODS_LIMIT,
  FOOD_SORT_FIELDS,
} from "@src/constants/foodConstants";

const foodTypeEnum = z.enum([
  "local-dish",
  "meze",
  "street-food",
  "seafood",
  "dessert",
  "bakery",
  "cheese",
  "olive-oil",
  "wine",
  "ouzo",
  "taverna",
]);

const foodStatusEnum = z.enum(["draft", "published", "archived"]);

const createFoodSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    tagLine: z.string().trim().min(1).max(150),
    foodType: foodTypeEnum,
    status: foodStatusEnum.optional(),
    about: z.string().trim().optional(),
    region: z.string().trim().min(1).optional(),
    destination: z.string().trim().min(1).optional(),
    place: z.string().trim().min(1).optional(),
    photoGallery: z.array(z.url()).min(MIN_FOOD_IMAGES),
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

const updateFoodSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    tagLine: z.string().trim().min(1).max(150).optional(),
    foodType: foodTypeEnum.optional(),
    status: foodStatusEnum.optional(),
    about: z.string().trim().optional(),
    region: z.string().trim().min(1).optional(),
    destination: z.string().trim().min(1).optional(),
    place: z.string().trim().min(1).optional(),
    photoGallery: z.array(z.url()).min(MIN_FOOD_IMAGES).optional(),
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

const getFoodsQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(DEFAULT_FOODS_PAGE),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_FOODS_LIMIT)
    .default(DEFAULT_FOODS_LIMIT),
  sortBy: z.enum(FOOD_SORT_FIELDS).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  foodType: foodTypeEnum.optional(),
  status: foodStatusEnum.optional(),
  region: z.string().trim().optional(),
  destination: z.string().trim().optional(),
  place: z.string().trim().optional(),
});

export {
  createFoodSchema,
  updateFoodSchema,
  updateFeaturedStatusSchema,
  updateIndexableStatusSchema,
  getFoodsQuerySchema,
};
