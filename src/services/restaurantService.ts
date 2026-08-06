import { Types, type PipelineStage } from "mongoose";
import RestaurantModel from "@src/models/restaurantModel";
import { deleteImagesFromS3 } from "@src/services/s3Service";
import AppError from "@src/utils/appError";
import { generateUniqueSlug } from "@src/utils/slug";
import { resolveReference } from "@src/utils/resolveReference";
import APIFeatures from "@src/utils/apiFeatures";
import type {
  CreateRestaurantBody,
  UpdateRestaurantBody,
  GetRestaurantsQuery,
} from "@src/types/restaurantType";

// FUNCTION
const createRestaurantService = async (body: CreateRestaurantBody) => {
  // 1 : Verify whichever single reference was submitted actually exists
  const reference = await resolveReference(body);

  // 2 : Generate a unique slug from the restaurant name
  const slug = await generateUniqueSlug(RestaurantModel, body.name);

  // 3 : Create the restaurant in the database
  const restaurant = await RestaurantModel.create({
    ...body,
    ...reference,
    slug,
  });

  // 4 : Send response
  return { restaurant };
};

// FUNCTION
const getRestaurantsService = async (query: GetRestaurantsQuery) => {
  // 1 : The three reference filters need ObjectId casting before they can be matched
  const filterQuery = {
    ...query,
    region: query.region ? new Types.ObjectId(query.region) : undefined,
    destination: query.destination
      ? new Types.ObjectId(query.destination)
      : undefined,
    place: query.place ? new Types.ObjectId(query.place) : undefined,
  };

  // 2 : Restaurants carry no joined references, so there are no base stages
  const basePipeline: PipelineStage[] = [];

  // 3 : Build and run the aggregation pipeline to get the page of results
  // and the total count in one round trip
  const { data: restaurants, pagination } = await new APIFeatures(
    RestaurantModel,
    filterQuery,
    basePipeline,
  )
    .filter(["status", "type", "priceRange", "region", "destination", "place"])
    .search(["name"])
    .sort()
    .projection()
    .paginate()
    .exec();

  // 4 : Send response
  return { restaurants, pagination };
};

// FUNCTION
const getRestaurantByIdService = async (id: string) => {
  // 1 : Fetch the restaurant
  const restaurant = await RestaurantModel.findById(id);
  if (!restaurant) {
    throw new AppError(404, "Restaurant not found");
  }

  // 2 : Send response
  return { restaurant };
};

// FUNCTION
const updateRestaurantService = async (
  id: string,
  body: UpdateRestaurantBody,
) => {
  // 1 : Find the restaurant to update
  const restaurant = await RestaurantModel.findById(id);
  if (!restaurant) {
    throw new AppError(404, "Restaurant not found");
  }

  // 2 : If the reference is being changed, verify the new one exists and
  // drop whichever reference was previously set
  const reference =
    body.region || body.destination || body.place
      ? await resolveReference(body)
      : null;

  const previousPhotoGallery = restaurant.photoGallery;

  // 3 : Regenerate the slug if the name is changing
  if (body.name && body.name !== restaurant.name) {
    restaurant.slug = await generateUniqueSlug(
      RestaurantModel,
      body.name,
      restaurant._id.toString(),
    );
  }

  // 4 : Apply the update and persist it
  Object.assign(restaurant, body, reference ?? {});
  await restaurant.save();

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
  return { restaurant };
};

// FUNCTION
const deleteRestaurantService = async (id: string) => {
  // 1 : Find the restaurant to delete
  const restaurant = await RestaurantModel.findById(id);
  if (!restaurant) {
    throw new AppError(404, "Restaurant not found");
  }

  // 2 : Delete the restaurant
  await restaurant.deleteOne();

  // 3 : Clean up its photo gallery images from S3
  if (restaurant.photoGallery.length > 0) {
    await deleteImagesFromS3(restaurant.photoGallery);
  }

  // 4 : Send response
  return null;
};

export {
  createRestaurantService,
  getRestaurantsService,
  getRestaurantByIdService,
  updateRestaurantService,
  deleteRestaurantService,
};
