import type { z } from "zod";
import type { createUserSchema } from "@src/validations/userValidation";

type CreateUserBody = z.infer<typeof createUserSchema>;

interface GetUsersQuery {
  search?: string;
  projection?: string;
  page: number;
  limit: number;
  sortBy: "fullName" | "createdAt" | "updatedAt";
  sortOrder: "asc" | "desc";
  role?: string;
  isVerified?: boolean;
}

export type { CreateUserBody, GetUsersQuery };
