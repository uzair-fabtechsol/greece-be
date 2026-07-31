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

export type { GetUsersQuery };
