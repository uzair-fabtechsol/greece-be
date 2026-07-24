import { z } from "zod";
import {
  MIN_ACTIVITY_IMAGES,
  MAX_HIGHLIGHTS,
  MAX_WHATS_INCLUDED,
  MAX_WHAT_TO_EXPECT,
  MAX_GOOD_TO_KNOW,
  DEFAULT_ACTIVITIES_PAGE,
  DEFAULT_ACTIVITIES_LIMIT,
  MAX_ACTIVITIES_LIMIT,
  ACTIVITY_SORT_FIELDS,
} from "@src/constants/activityConstants";
import {
  NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
  TAGLINE_MAX_LENGTH,
} from "@src/constants/limitConstants";

const typeEnum = z.enum([
  "boating",
  "hiking",
  "scubaDiving",
  "snorkeling",
  "sailing",
  "kayaking",
  "windsurfing",
  "paragliding",
  "wineTasting",
  "cookingClass",
  "culturalTour",
  "photographyTour",
  "horsebackRiding",
  "cycling",
  "rockClimbing",
  "fishing",
]);

const activityStatusEnum = z.enum(["draft", "published", "archived"]);

const createActivitySchema = z
  .object({
    name: z.string().trim().min(NAME_MIN_LENGTH).max(NAME_MAX_LENGTH),
    tagLine: z.string().trim().min(1).max(TAGLINE_MAX_LENGTH),
    type: typeEnum,
    status: activityStatusEnum.optional(),
    about: z.string().trim().optional(),
    highlights: z.array(z.string().trim()).max(MAX_HIGHLIGHTS).optional(),
    whatsIncluded: z
      .array(z.string().trim())
      .max(MAX_WHATS_INCLUDED)
      .optional(),
    whatToExpect: z
      .array(z.string().trim())
      .max(MAX_WHAT_TO_EXPECT)
      .optional(),
    goodToKnow: z.array(z.string().trim()).max(MAX_GOOD_TO_KNOW).optional(),
    region: z.string().trim().min(1).optional(),
    destination: z.string().trim().min(1).optional(),
    place: z.string().trim().min(1).optional(),
    photoGallery: z.array(z.url()).min(MIN_ACTIVITY_IMAGES),
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

const updateActivitySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(NAME_MIN_LENGTH)
      .max(NAME_MAX_LENGTH)
      .optional(),
    tagLine: z.string().trim().min(1).max(TAGLINE_MAX_LENGTH).optional(),
    type: typeEnum.optional(),
    status: activityStatusEnum.optional(),
    about: z.string().trim().optional(),
    highlights: z.array(z.string().trim()).max(MAX_HIGHLIGHTS).optional(),
    whatsIncluded: z
      .array(z.string().trim())
      .max(MAX_WHATS_INCLUDED)
      .optional(),
    whatToExpect: z
      .array(z.string().trim())
      .max(MAX_WHAT_TO_EXPECT)
      .optional(),
    goodToKnow: z.array(z.string().trim()).max(MAX_GOOD_TO_KNOW).optional(),
    region: z.string().trim().min(1).optional(),
    destination: z.string().trim().min(1).optional(),
    place: z.string().trim().min(1).optional(),
    photoGallery: z.array(z.url()).min(MIN_ACTIVITY_IMAGES).optional(),
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

const getActivitiesQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(DEFAULT_ACTIVITIES_PAGE),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_ACTIVITIES_LIMIT)
    .default(DEFAULT_ACTIVITIES_LIMIT),
  sortBy: z.enum(ACTIVITY_SORT_FIELDS).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  type: typeEnum.optional(),
  status: activityStatusEnum.optional(),
  region: z.string().trim().optional(),
  destination: z.string().trim().optional(),
  place: z.string().trim().optional(),
});

export {
  createActivitySchema,
  updateActivitySchema,
  updateFeaturedStatusSchema,
  updateIndexableStatusSchema,
  getActivitiesQuerySchema,
};
