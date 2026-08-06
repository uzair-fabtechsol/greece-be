interface CreateRegionBody {
  name: string;
  tagLine: string;
  type: string[];
  bestSeason: string[];
  status?: "draft" | "published" | "archived";
  about?: string;
  photoGallery: string[];
  tipsAndTricks?: string[];
  faqs?: { question: string; answer: string }[];
}

type UpdateRegionBody = Partial<CreateRegionBody>;

interface GetRegionsQuery {
  search?: string;
  projection?: string;
  page: number;
  limit: number;
  sortBy: "name" | "createdAt" | "updatedAt";
  sortOrder: "asc" | "desc";
  type?: string[];
  bestSeason?: string;
  status?: string;
}

interface GetRegionRecommendationsQuery {
  historyAndCulture: number;
  beachesAndCoasts: number;
  foodAndWine: number;
  natureAndOutdoors: number;
  nightLife: number;
  relaxation: number;
}

export type {
  CreateRegionBody,
  UpdateRegionBody,
  GetRegionsQuery,
  GetRegionRecommendationsQuery,
};
