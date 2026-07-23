import { Types, type PipelineStage } from "mongoose";
import PlaceModel from "@src/models/placeModel";
import DestinationModel from "@src/models/destinationModel";
import { deleteImagesFromS3 } from "@src/services/s3Services";
import AppError from "@src/utils/appError";
import { generateUniqueSlug } from "@src/utils/slug";
import type {
  CreatePlaceBody,
  UpdatePlaceBody,
  GetPlacesQuery,
} from "@src/types/placeTypes";
import type { Pagination } from "@src/utils/sendResponse";

const destinationLookupStages: PipelineStage.FacetPipelineStage[] = [
  {
    $lookup: {
      from: "destinations",
      localField: "destination",
      foreignField: "_id",
      as: "destinationDetails",
      pipeline: [{ $project: { _id: 1, name: 1 } }],
    },
  },
  { $unwind: "$destinationDetails" },
  { $project: { destination: 0 } },
];

// FUNCTION
const createPlaceService = async (body: CreatePlaceBody) => {
  // 1 : Check that the referenced destination exists
  const destination = await DestinationModel.findById(body.destination);
  if (!destination) {
    throw new AppError(404, "Destination not found");
  }

  // 2 : Generate a unique slug from the place name
  const slug = await generateUniqueSlug(PlaceModel, body.name);

  // 3 : Create the place in the database
  const place = await PlaceModel.create({ ...body, slug });

  // 4 : Send response
  return { place };
};

// FUNCTION
const getPlacesService = async (query: GetPlacesQuery) => {
  // 1 : Extract filters, sorting, and pagination options from the query
  const { search, page, limit, sortBy, sortOrder, placeType, status, destination } =
    query;

  // 2 : Build the match stage from the provided filters
  const match: Record<string, unknown> = {};

  if (status) match.status = status;
  if (placeType) match.placeType = placeType;
  if (destination) match.destination = new Types.ObjectId(destination);
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
        data: [{ $skip: skip }, { $limit: limit }, ...destinationLookupStages],
        totalCount: [{ $count: "count" }],
      },
    },
  ];

  const [result] = await PlaceModel.aggregate(pipeline);
  const places = result?.data ?? [];
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
  return { places, pagination };
};

// FUNCTION
const getPlaceByIdService = async (id: string) => {
  // 1 : Fetch the place with its destination populated as destinationDetails
  const pipeline: PipelineStage[] = [
    { $match: { _id: new Types.ObjectId(id) } },
    ...destinationLookupStages,
  ];

  const [place] = await PlaceModel.aggregate(pipeline);
  if (!place) {
    throw new AppError(404, "Place not found");
  }

  // 2 : Send response
  return { place };
};

// FUNCTION
const updatePlaceService = async (id: string, body: UpdatePlaceBody) => {
  // 1 : Find the place to update
  const place = await PlaceModel.findById(id);
  if (!place) {
    throw new AppError(404, "Place not found");
  }

  // 2 : If the destination is being changed, check that the new destination exists
  if (body.destination) {
    const destination = await DestinationModel.findById(body.destination);
    if (!destination) {
      throw new AppError(404, "Destination not found");
    }
  }

  const previousPhotoGallery = place.photoGallery;
  const previousHeritageImages = (place.heritage ?? []).map(
    (h: { image: string }) => h.image,
  );

  // 3 : Regenerate the slug if the name is changing
  if (body.name && body.name !== place.name) {
    place.slug = await generateUniqueSlug(
      PlaceModel,
      body.name,
      place._id.toString(),
    );
  }

  // 4 : Apply the update and persist it
  Object.assign(place, body);
  await place.save();

  // 5 : Only after the update is persisted, remove any photoGallery images that were
  // dropped so we never delete from S3 on a failed save
  if (body.photoGallery) {
    const newPhotoGallery = body.photoGallery;
    const removedImages = (previousPhotoGallery ?? []).filter(
      (url: string) => !newPhotoGallery.includes(url),
    );

    if (removedImages.length > 0) {
      await deleteImagesFromS3(removedImages);
    }
  }

  // 6 : Same cleanup for heritage images, since each heritage entry also holds an S3 image
  if (body.heritage) {
    const newHeritageImages = body.heritage.map((h) => h.image);
    const removedHeritageImages = previousHeritageImages.filter(
      (url: string) => !newHeritageImages.includes(url),
    );

    if (removedHeritageImages.length > 0) {
      await deleteImagesFromS3(removedHeritageImages);
    }
  }

  // 7 : Send response
  return { place };
};

// FUNCTION
const deletePlaceService = async (id: string) => {
  // 1 : Find the place to delete
  const place = await PlaceModel.findById(id);
  if (!place) {
    throw new AppError(404, "Place not found");
  }

  // 2 : Delete the place
  await place.deleteOne();

  // 3 : Clean up its photo gallery and heritage images from S3
  const imagesToDelete = [
    ...place.photoGallery,
    ...(place.heritage ?? []).map((h: { image: string }) => h.image),
  ];

  if (imagesToDelete.length > 0) {
    await deleteImagesFromS3(imagesToDelete);
  }

  // 4 : Send response
  return null;
};

export {
  createPlaceService,
  getPlacesService,
  getPlaceByIdService,
  updatePlaceService,
  deletePlaceService,
};
