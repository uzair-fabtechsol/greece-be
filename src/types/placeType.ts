interface CreatePlaceBody {
  destination: string;
  name: string;
  tagLine: string;
  type: string;
  status?: "draft" | "published" | "archived";
  about?: string;
  heritage?: { image: string; historicalFact: string }[];
  sustainabilityNotes?: string[];
  photoGallery: string[];
  tipsAndTricks?: string[];
}

type UpdatePlaceBody = Partial<CreatePlaceBody>;

interface GetPlacesQuery {
  search?: string;
  projection?: string;
  page: number;
  limit: number;
  sortBy: "name" | "createdAt" | "updatedAt";
  sortOrder: "asc" | "desc";
  type?: string;
  status?: string;
  destination?: string[];
}

export type { CreatePlaceBody, UpdatePlaceBody, GetPlacesQuery };
