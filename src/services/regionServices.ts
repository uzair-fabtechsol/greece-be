import type { PipelineStage } from "mongoose";
import RegionModel from "@src/models/regionModel";
import DestinationModel from "@src/models/destinationModel";
import { deleteImagesFromS3 } from "@src/services/s3Services";
import AppError from "@src/utils/appError";
import { generateUniqueSlug } from "@src/utils/slug";
import type {
  CreateRegionBody,
  UpdateRegionBody,
  GetRegionsQuery,
} from "@src/types/regionTypes";
import type { Pagination } from "@src/utils/sendResponse";

// FUNCTION
const createRegionService = async (body: CreateRegionBody) => {
  // 1 : Generate a unique slug from the region name
  const slug = await generateUniqueSlug(RegionModel, body.name);

  // 2 : Create the region in the database
  const region = await RegionModel.create({ ...body, slug });

  // 3 : Send response
  return { region };
};

// FUNCTION
const getRegionsService = async (query: GetRegionsQuery) => {
  // 1 : Extract filters, sorting, and pagination options from the query
  const {
    search,
    page,
    limit,
    sortBy,
    sortOrder,
    regionType,
    bestSeason,
    status,
  } = query;

  // 2 : Build the match stage from the provided filters
  const match: Record<string, unknown> = {};

  if (status) match.status = status;
  if (regionType) match.regionType = regionType;
  if (bestSeason) match.bestSeason = bestSeason;
  if (search) {
    match.$or = [
      { name: { $regex: search, $options: "i" } },
      { tagLine: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  // 3 : Run the aggregation pipeline to get the page of results and the total count in one round trip
  const pipeline: PipelineStage[] = [
    { $match: match },
    { $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "count" }],
      },
    },
  ];

  const [result] = await RegionModel.aggregate(pipeline);
  const regions = result?.data ?? [];
  const totalDocuments: number = result?.totalCount[0]?.count ?? 0;
  const totalPages = Math.ceil(totalDocuments / limit);

  // 4 : Build the pagination metadata
  const pagination: Pagination = {
    page,
    limit,
    totalDocuments,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };

  // 5 : Send response
  return { regions, pagination };
};

// FUNCTION
const getRegionByIdService = async (id: string) => {
  // 1 : Find the region by id
  const region = await RegionModel.findById(id);
  if (!region) {
    throw new AppError(404, "Region not found");
  }

  // 2 : Send response
  return { region };
};

// FUNCTION
const updateRegionService = async (id: string, body: UpdateRegionBody) => {
  // 1 : Find the region to update
  const region = await RegionModel.findById(id);
  if (!region) {
    throw new AppError(404, "Region not found");
  }

  const previousPhotoGallery = region.photoGallery;

  // 2 : Regenerate the slug if the name is changing
  if (body.name && body.name !== region.name) {
    region.slug = await generateUniqueSlug(
      RegionModel,
      body.name,
      region._id.toString(),
    );
  }

  // 3 : Apply the update and persist it
  Object.assign(region, body);
  await region.save();

  // 4 : Only after the update is persisted, remove any images that were
  // dropped from photoGallery so we never delete from S3 on a failed save
  if (body.photoGallery) {
    const newPhotoGallery = body.photoGallery;
    const removedImages = (previousPhotoGallery ?? []).filter(
      (url: string) => !newPhotoGallery.includes(url),
    );

    if (removedImages.length > 0) {
      await deleteImagesFromS3(removedImages);
    }
  }

  // 5 : Send response
  return { region };
};

// FUNCTION
const deleteRegionService = async (id: string) => {
  // 1 : Find the region to delete
  const region = await RegionModel.findById(id);
  if (!region) {
    throw new AppError(404, "Region not found");
  }

  // 2 : Prevent deletion if any destination still references this region
  const hasDestinations = await DestinationModel.exists({ region: id });
  if (hasDestinations) {
    throw new AppError(
      400,
      "Cannot delete a region that has destinations. Delete or reassign its destinations first.",
    );
  }

  // 3 : Delete the region
  await region.deleteOne();

  // 4 : Clean up its photo gallery images from S3
  if (region.photoGallery.length > 0) {
    await deleteImagesFromS3(region.photoGallery);
  }

  // 5 : Send response
  return null;
};

export {
  createRegionService,
  getRegionsService,
  getRegionByIdService,
  updateRegionService,
  deleteRegionService,
};
