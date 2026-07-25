import RegionModel from "@src/models/regionModel";
import DestinationModel from "@src/models/destinationModel";
import { deleteImagesFromS3 } from "@src/services/s3Services";
import AppError from "@src/utils/appError";
import { generateUniqueSlug } from "@src/utils/slug";
import APIFeatures from "@src/utils/apiFeatures";
import type {
  CreateRegionBody,
  UpdateRegionBody,
  GetRegionsQuery,
} from "@src/types/regionTypes";

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
  // 1 : Build and run the aggregation pipeline to get the page of results
  // and the total count in one round trip
  const { data: regions, pagination } = await new APIFeatures(
    RegionModel,
    query,
  )
    .filter(["status", "type", "bestSeason"])
    .search(["name", "tagLine"])
    .sort()
    .paginate()
    .exec();

  // 2 : Send response
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
