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
  page: number;
  limit: number;
  sortBy: "name" | "createdAt" | "updatedAt";
  sortOrder: "asc" | "desc";
  type?: string;
  bestSeason?: string;
  status?: string;
}

export type { CreateRegionBody, UpdateRegionBody, GetRegionsQuery };
