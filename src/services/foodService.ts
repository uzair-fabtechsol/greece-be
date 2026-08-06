import { Types, type PipelineStage } from "mongoose";
import FoodModel from "@src/models/foodModel";
import { deleteImagesFromS3 } from "@src/services/s3Service";
import AppError from "@src/utils/appError";
import { generateUniqueSlug } from "@src/utils/slug";
import { resolveReference } from "@src/utils/resolveReference";
import APIFeatures from "@src/utils/apiFeatures";
import type {
  CreateFoodBody,
  UpdateFoodBody,
  GetFoodsQuery,
} from "@src/types/foodType";

// FUNCTION
const createFoodService = async (body: CreateFoodBody) => {
  // 1 : Verify whichever single reference was submitted actually exists
  const reference = await resolveReference(body);

  // 2 : Generate a unique slug from the food name
  const slug = await generateUniqueSlug(FoodModel, body.name);

  // 3 : Create the food in the database
  const food = await FoodModel.create({
    ...body,
    ...reference,
    slug,
  });

  // 4 : Send response
  return { food };
};

// FUNCTION
const getFoodsService = async (query: GetFoodsQuery) => {
  // 1 : The three reference filters need ObjectId casting before they can be matched
  const filterQuery = {
    ...query,
    region: query.region?.map((region) => new Types.ObjectId(region)),
    destination: query.destination?.map(
      (destination) => new Types.ObjectId(destination),
    ),
    place: query.place?.map((place) => new Types.ObjectId(place)),
  };

  // 2 : Foods carry no joined references, so there are no base stages
  const basePipeline: PipelineStage[] = [];

  // 3 : Build and run the aggregation pipeline to get the page of results
  // and the total count in one round trip
  const { data: foods, pagination } = await new APIFeatures(
    FoodModel,
    filterQuery,
    basePipeline,
  )
    .filter(["status", "type", "region", "destination", "place"])
    .search(["name"])
    .sort()
    .projection()
    .paginate()
    .exec();

  // 4 : Send response
  return { foods, pagination };
};

// FUNCTION
const getFoodByIdService = async (id: string) => {
  // 1 : Fetch the food
  const food = await FoodModel.findById(id);
  if (!food) {
    throw new AppError(404, "Food not found");
  }

  // 2 : Send response
  return { food };
};

// FUNCTION
const updateFoodService = async (id: string, body: UpdateFoodBody) => {
  // 1 : Find the food to update
  const food = await FoodModel.findById(id);
  if (!food) {
    throw new AppError(404, "Food not found");
  }

  // 2 : If the reference is being changed, verify the new one exists and
  // drop whichever reference was previously set
  const reference =
    body.region || body.destination || body.place
      ? await resolveReference(body)
      : null;

  const previousPhotoGallery = food.photoGallery;

  // 3 : Regenerate the slug if the name is changing
  if (body.name && body.name !== food.name) {
    food.slug = await generateUniqueSlug(
      FoodModel,
      body.name,
      food._id.toString(),
    );
  }

  // 4 : Apply the update and persist it
  Object.assign(food, body, reference ?? {});
  await food.save();

  // 5 : Only after the update is persisted, remove any images that were
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

  // 6 : Send response
  return { food };
};

// FUNCTION
const deleteFoodService = async (id: string) => {
  // 1 : Find the food to delete
  const food = await FoodModel.findById(id);
  if (!food) {
    throw new AppError(404, "Food not found");
  }

  // 2 : Delete the food
  await food.deleteOne();

  // 3 : Clean up its photo gallery images from S3
  if (food.photoGallery.length > 0) {
    await deleteImagesFromS3(food.photoGallery);
  }

  // 4 : Send response
  return null;
};

export {
  createFoodService,
  getFoodsService,
  getFoodByIdService,
  updateFoodService,
  deleteFoodService,
};
