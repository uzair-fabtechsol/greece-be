import { Types, type PipelineStage } from "mongoose";
import RestaurantModel from "@src/models/restaurantModel";
import { deleteImagesFromS3 } from "@src/services/s3Services";
import AppError from "@src/utils/appError";
import { generateUniqueSlug } from "@src/utils/slug";
import { resolveReference } from "@src/utils/resolveReference";
import type {
  CreateRestaurantBody,
  UpdateRestaurantBody,
  GetRestaurantsQuery,
} from "@src/types/restaurantTypes";
import type { Pagination } from "@src/utils/sendResponse";

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
  // 1 : Extract filters, sorting, and pagination options from the query
  const {
    search,
    page,
    limit,
    sortBy,
    sortOrder,
    type,
    priceRange,
    status,
    region,
    destination,
    place,
  } = query;

  // 2 : Build the match stage from the provided filters
  const match: Record<string, unknown> = {};

  if (status) match.status = status;
  if (type) match.type = type;
  if (priceRange) match.priceRange = priceRange;
  if (region) match.region = new Types.ObjectId(region);
  if (destination) match.destination = new Types.ObjectId(destination);
  if (place) match.place = new Types.ObjectId(place);
  if (search) {
    match.$or = [
      { name: { $regex: search, $options: "i" } },
      { about: { $regex: search, $options: "i" } },
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

  const [result] = await RestaurantModel.aggregate(pipeline);
  const restaurants = result?.data ?? [];
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
