import { Types, type PipelineStage } from "mongoose";
import PlaceModel from "@src/models/placeModel";
import DestinationModel from "@src/models/destinationModel";
import { deleteImagesFromS3 } from "@src/services/s3Services";
import AppError from "@src/utils/appError";
import { generateUniqueSlug } from "@src/utils/slug";
import APIFeatures from "@src/utils/apiFeatures";
import type {
  CreatePlaceBody,
  UpdatePlaceBody,
  GetPlacesQuery,
} from "@src/types/placeTypes";

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
  // 1 : Destination needs ObjectId casting before it can be matched
  const filterQuery = {
    ...query,
    "destinationDetails._id": query.destination
      ? new Types.ObjectId(query.destination)
      : undefined,
  };

  // 2 : Resource-specific stage: join the referenced destination onto each result
  const basePipeline: PipelineStage[] = [...destinationLookupStages];

  // 3 : Build and run the aggregation pipeline to get the page of results
  // and the total count in one round trip
  const { data: places, pagination } = await new APIFeatures(
    PlaceModel,
    filterQuery,
    basePipeline,
  )
    .filter(["status", "type", "destinationDetails._id"])
    .search(["name"])
    .sort()
    .projection()
    .paginate()
    .exec();

  // 4 : Send response
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
