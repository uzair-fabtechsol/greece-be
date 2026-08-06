import { z } from "zod";
import { PASSWORD_MIN_LENGTH } from "@src/constants/authConstant";
import {
  NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
} from "@src/constants/limitConstant";
import {
  DEFAULT_USERS_PAGE,
  DEFAULT_USERS_LIMIT,
  MAX_USERS_LIMIT,
  USER_SORT_FIELDS,
} from "@src/constants/userConstant";
import { Role } from "@src/models/userModel";

const roleEnum = z.enum(Object.values(Role) as [string, ...string[]]);

const createUserSchema = z
  .object({
    fullName: z.string().trim().min(NAME_MIN_LENGTH).max(NAME_MAX_LENGTH),
    email: z.email().trim().toLowerCase(),
    password: z.string().min(PASSWORD_MIN_LENGTH),
    // Admin is the only role this endpoint can mint. Travellers and advertisers
    // come through signup, and superAdmin is seeded, never created over HTTP.
    role: z.literal(Role.Admin),
  })
  .strict();

const getUsersQuerySchema = z
  .object({
    search: z.string().trim().optional(),
    projection: z.string().trim().optional(),
    page: z.coerce.number().int().min(1).default(DEFAULT_USERS_PAGE),
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(MAX_USERS_LIMIT)
      .default(DEFAULT_USERS_LIMIT),
    sortBy: z.enum(USER_SORT_FIELDS).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    // Comma-separated list of roles (e.g. "traveller,advertiser") so a single
    // filter can express a group of roles, not just one.
    role: z
      .string()
      .trim()
      .transform((value) =>
        value
          .split(",")
          .map((role) => role.trim())
          .filter(Boolean),
      )
      .pipe(z.array(roleEnum).min(1))
      .optional(),
    isVerified: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional(),
  })
  .strict();

export { createUserSchema, getUsersQuerySchema };
