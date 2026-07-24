interface CreateFoodBody {
  name: string;
  tagLine: string;
  foodType: string;
  status?: "draft" | "published" | "archived";
  about?: string;
  region?: string;
  destination?: string;
  place?: string;
  photoGallery: string[];
  isFeatured?: boolean;
  isIndexable?: boolean;
}

type UpdateFoodBody = Partial<CreateFoodBody>;

interface UpdateFeaturedStatusBody {
  isFeatured: boolean;
}

interface UpdateIndexableStatusBody {
  isIndexable: boolean;
}

interface GetFoodsQuery {
  search?: string;
  page: number;
  limit: number;
  sortBy: "name" | "createdAt" | "updatedAt";
  sortOrder: "asc" | "desc";
  foodType?: string;
  status?: string;
  region?: string;
  destination?: string;
  place?: string;
}

export type {
  CreateFoodBody,
  UpdateFoodBody,
  UpdateFeaturedStatusBody,
  UpdateIndexableStatusBody,
  GetFoodsQuery,
};
