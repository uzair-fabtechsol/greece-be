interface CreateActivityBody {
  name: string;
  tagLine: string;
  activityType: string;
  status?: "draft" | "published" | "archived";
  about?: string;
  highlights?: string[];
  whatsIncluded?: string[];
  whatToExpect?: string[];
  goodToKnow?: string[];
  region?: string;
  destination?: string;
  place?: string;
  photoGallery: string[];
  isFeatured?: boolean;
  isIndexable?: boolean;
}

type UpdateActivityBody = Partial<CreateActivityBody>;

interface UpdateFeaturedStatusBody {
  isFeatured: boolean;
}

interface UpdateIndexableStatusBody {
  isIndexable: boolean;
}

interface GetActivitiesQuery {
  search?: string;
  page: number;
  limit: number;
  sortBy: "name" | "createdAt" | "updatedAt";
  sortOrder: "asc" | "desc";
  activityType?: string;
  status?: string;
  region?: string;
  destination?: string;
  place?: string;
}

export type {
  CreateActivityBody,
  UpdateActivityBody,
  UpdateFeaturedStatusBody,
  UpdateIndexableStatusBody,
  GetActivitiesQuery,
};
