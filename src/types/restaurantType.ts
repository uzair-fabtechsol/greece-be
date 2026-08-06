interface CreateRestaurantBody {
  name: string;
  tagLine: string;
  type: string;
  priceRange: string;
  status?: "draft" | "published" | "archived";
  about?: string;
  region?: string;
  destination?: string;
  place?: string;
  photoGallery: string[];
  isFeatured?: boolean;
  isIndexable?: boolean;
}

type UpdateRestaurantBody = Partial<CreateRestaurantBody>;

interface UpdateFeaturedStatusBody {
  isFeatured: boolean;
}

interface UpdateIndexableStatusBody {
  isIndexable: boolean;
}

interface GetRestaurantsQuery {
  search?: string;
  projection?: string;
  page: number;
  limit: number;
  sortBy: "name" | "createdAt" | "updatedAt";
  sortOrder: "asc" | "desc";
  type?: string;
  priceRange?: string;
  status?: string;
  region?: string[];
  destination?: string[];
  place?: string[];
}

export type {
  CreateRestaurantBody,
  UpdateRestaurantBody,
  UpdateFeaturedStatusBody,
  UpdateIndexableStatusBody,
  GetRestaurantsQuery,
};
