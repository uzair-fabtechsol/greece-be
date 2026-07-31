interface CreateDestinationBody {
  region: string;
  name: string;
  tagLine: string;
  type: string;
  status?: "draft" | "published" | "archived";
  quickFacts: {
    country: string;
    language: string;
    currency: {
      currencyName: string;
      currencySign: string;
    };
    timeZone: string;
    bestSeason: string[];
  };
  about?: string;
  photoGallery: string[];
  tipsAndTricks?: string[];
}

type UpdateDestinationBody = Partial<CreateDestinationBody>;

interface GetDestinationsQuery {
  search?: string;
  projection?: string;
  page: number;
  limit: number;
  sortBy: "name" | "createdAt" | "updatedAt";
  sortOrder: "asc" | "desc";
  type?: string;
  status?: string;
  bestSeason?: string;
  region?: string;
}

export type {
  CreateDestinationBody,
  UpdateDestinationBody,
  GetDestinationsQuery,
};
