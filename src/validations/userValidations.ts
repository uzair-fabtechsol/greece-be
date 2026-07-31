import { z } from "zod";
import {
  DEFAULT_USERS_PAGE,
  DEFAULT_USERS_LIMIT,
  MAX_USERS_LIMIT,
  USER_SORT_FIELDS,
} from "@src/constants/userConstants";
import { Role } from "@src/models/userModel";

const roleEnum = z.enum(Object.values(Role) as [string, ...string[]]);

const getUsersQuerySchema = z.object({
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
  role: roleEnum.optional(),
  isVerified: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
});

export { getUsersQuerySchema };
