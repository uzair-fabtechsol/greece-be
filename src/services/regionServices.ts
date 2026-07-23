import type { PipelineStage } from "mongoose";
import RegionModel from "@src/models/regionModel";
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
  const slug = await generateUniqueSlug(RegionModel, body.name);

  const region = await RegionModel.create({ ...body, slug });

  return { region };
};

// FUNCTION
const getRegionsService = async (query: GetRegionsQuery) => {
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

  const pagination: Pagination = {
    page,
    limit,
    totalDocuments,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };

  return { regions, pagination };
};

// FUNCTION
const getRegionByIdService = async (id: string) => {
  const region = await RegionModel.findById(id);
  if (!region) {
    throw new AppError(404, "Region not found");
  }

  return { region };
};

// FUNCTION
const updateRegionService = async (id: string, body: UpdateRegionBody) => {
  const region = await RegionModel.findById(id);
  if (!region) {
    throw new AppError(404, "Region not found");
  }

  const previousPhotoGallery = region.photoGallery;

  if (body.name && body.name !== region.name) {
    region.slug = await generateUniqueSlug(
      RegionModel,
      body.name,
      region._id.toString(),
    );
  }

  Object.assign(region, body);
  await region.save();

  // Only after the update is persisted, remove any images that were
  // dropped from photoGallery so we never delete from S3 on a failed save.
  if (body.photoGallery) {
    const newPhotoGallery = body.photoGallery;
    const removedImages = (previousPhotoGallery ?? []).filter(
      (url: string) => !newPhotoGallery.includes(url),
    );

    if (removedImages.length > 0) {
      await deleteImagesFromS3(removedImages);
    }
  }

  return { region };
};

// FUNCTION
const deleteRegionService = async (id: string) => {
  const region = await RegionModel.findById(id);
  if (!region) {
    throw new AppError(404, "Region not found");
  }

  await region.deleteOne();

  if (region.photoGallery.length > 0) {
    await deleteImagesFromS3(region.photoGallery);
  }

  return null;
};

export {
  createRegionService,
  getRegionsService,
  getRegionByIdService,
  updateRegionService,
  deleteRegionService,
};
