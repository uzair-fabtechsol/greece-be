import type { Model, PipelineStage } from "mongoose";
import type { Pagination } from "@src/utils/sendResponse";

interface BaseListQuery {
  search?: string;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

// FUNCTION
// Chainable aggregation pipeline builder for paginated list endpoints.
// Takes a base pipeline (any resource-specific stages the service already
// needs, e.g. ObjectId-cast reference filters) and layers generic,
// query-driven stages on top. Each chained method inspects the query
// itself and no-ops when its corresponding field wasn't submitted, so
// callers can always chain the full set without guarding each call.
class APIFeatures<T> {
  private model: Model<T>;
  private query: BaseListQuery;
  private pipeline: PipelineStage[];

  constructor(model: Model<T>, query: BaseListQuery, basePipeline: PipelineStage[] = []) {
    this.model = model;
    this.query = query;
    this.pipeline = [...basePipeline];
  }

  // Adds a $match stage for each given field that was actually submitted
  // in the query (skips undefined, null, and empty string).
  filter(fields: string[]): this {
    const match: Record<string, unknown> = {};
    const query = this.query as unknown as Record<string, unknown>;

    for (const field of fields) {
      const value = query[field];
      if (value !== undefined && value !== null && value !== "") {
        match[field] = value;
      }
    }

    if (Object.keys(match).length > 0) {
      this.pipeline.push({ $match: match });
    }

    return this;
  }

  // Adds a case-insensitive regex $or search across the given fields,
  // only if a search term was submitted in the query.
  search(fields: string[]): this {
    if (this.query.search) {
      this.pipeline.push({
        $match: {
          $or: fields.map((field) => ({
            [field]: { $regex: this.query.search, $options: "i" },
          })),
        },
      });
    }

    return this;
  }

  // Adds a $sort stage from the query's sortBy/sortOrder.
  sort(): this {
    const { sortBy, sortOrder } = this.query;
    if (sortBy) {
      this.pipeline.push({ $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } });
    }

    return this;
  }

  // Adds the $facet stage that pages the results and counts the total in one round trip.
  paginate(): this {
    const { page, limit } = this.query;
    const skip = (page - 1) * limit;

    this.pipeline.push({
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "count" }],
      },
    });

    return this;
  }

  // Runs the assembled pipeline and returns the page of results alongside pagination metadata.
  async exec(): Promise<{ data: T[]; pagination: Pagination }> {
    const { page, limit } = this.query;

    const [result] = await this.model.aggregate(this.pipeline);
    const data: T[] = result?.data ?? [];
    const totalDocuments: number = result?.totalCount[0]?.count ?? 0;
    const totalPages = Math.ceil(totalDocuments / limit);

    const pagination: Pagination = {
      page,
      limit,
      totalDocuments,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    return { data, pagination };
  }
}

export default APIFeatures;
