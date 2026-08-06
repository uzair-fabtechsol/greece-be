import { Types, type PipelineStage } from "mongoose";
import DestinationModel from "@src/models/destinationModel";
import RegionModel from "@src/models/regionModel";
import PlaceModel from "@src/models/placeModel";
import { deleteImagesFromS3 } from "@src/services/s3Services";
import AppError from "@src/utils/appError";
import { assertNoLinkedContent } from "@src/utils/deleteGuards";
import { generateUniqueSlug } from "@src/utils/slug";
import APIFeatures from "@src/utils/apiFeatures";
import type {
  CreateDestinationBody,
  UpdateDestinationBody,
  GetDestinationsQuery,
} from "@src/types/destinationTypes";

const regionLookupStages: PipelineStage.FacetPipelineStage[] = [
  {
    $lookup: {
      from: "regions",
      localField: "region",
      foreignField: "_id",
      as: "regionDetails",
      pipeline: [{ $project: { _id: 1, name: 1 } }],
    },
  },
  { $unwind: "$regionDetails" },
  { $project: { region: 0 } },
];

// FUNCTION
const createDestinationService = async (body: CreateDestinationBody) => {
  // 1 : Check that the referenced region exists
  const region = await RegionModel.findById(body.region);
  if (!region) {
    throw new AppError(404, "Region not found");
  }

  // 2 : Generate a unique slug from the destination name
  const slug = await generateUniqueSlug(DestinationModel, body.name);

  // 3 : Create the destination in the database
  const destination = await DestinationModel.create({ ...body, slug });

  // 4 : Send response
  return { destination };
};

// FUNCTION
const getDestinationsService = async (query: GetDestinationsQuery) => {
  // 1 : Region needs ObjectId casting against the raw field (so filter/search/sort
  // stay index-eligible before the region lookup joins anything), and
  // quickFacts.bestSeason is nested, so normalize those onto the query
  // before handing it to APIFeatures
  const filterQuery = {
    ...query,
    region: query.region ? new Types.ObjectId(query.region) : undefined,
    "quickFacts.bestSeason": query.bestSeason,
  };

  // 2 : Build and run the aggregation pipeline to get the page of results
  // and the total count in one round trip. The region lookup is added via
  // .addStages() after filter/search/sort so those stages stay index-eligible.
  const { data: destinations, pagination } = await new APIFeatures(
    DestinationModel,
    filterQuery,
    [],
  )
    .filter(["status", "type", "quickFacts.bestSeason", "region"])
    .search(["name"])
    .sort()
    .addStages(regionLookupStages)
    .projection()
    .paginate()
    .exec();

  // 4 : Send response
  return { destinations, pagination };
};

// FUNCTION
const getDestinationByIdService = async (id: string) => {
  // 1 : Find the destination by id, pulling in the referenced region
  const destinationDoc = await DestinationModel.findById(id).populate<{
    region: { _id: Types.ObjectId; name: string };
  }>("region", "name");

  if (!destinationDoc) {
    throw new AppError(404, "Destination not found");
  }

  // 2 : Expose the region as regionDetails so the detail response keeps the
  // same shape the list endpoint's $lookup produces
  const { region, ...destination } = destinationDoc.toObject();

  // 3 : Send response
  return { destination: { ...destination, regionDetails: region } };
};

// FUNCTION
const updateDestinationService = async (
  id: string,
  body: UpdateDestinationBody,
) => {
  // 1 : Find the destination to update
  const destination = await DestinationModel.findById(id);
  if (!destination) {
    throw new AppError(404, "Destination not found");
  }

  // 2 : If the region is being changed, check that the new region exists
  if (body.region) {
    const region = await RegionModel.findById(body.region);
    if (!region) {
      throw new AppError(404, "Region not found");
    }
  }

  const previousPhotoGallery = destination.photoGallery;

  // 3 : Regenerate the slug if the name is changing
  if (body.name && body.name !== destination.name) {
    destination.slug = await generateUniqueSlug(
      DestinationModel,
      body.name,
      destination._id.toString(),
    );
  }

  // 4 : Apply the update and persist it
  Object.assign(destination, body);
  await destination.save();

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
  return { destination };
};

// FUNCTION
const deleteDestinationService = async (id: string) => {
  // 1 : Find the destination to delete
  const destination = await DestinationModel.findById(id);
  if (!destination) {
    throw new AppError(404, "Destination not found");
  }

  // 2 : Prevent deletion if any place still references this destination
  const hasPlaces = await PlaceModel.exists({ destination: id });
  if (hasPlaces) {
    throw new AppError(
      400,
      "Cannot delete a destination that has places. Delete or reassign its places first.",
    );
  }

  // 3 : Prevent deletion if any activity, food or restaurant references it
  await assertNoLinkedContent("destination", id);

  // 4 : Delete the destination
  await destination.deleteOne();

  // 5 : Clean up its photo gallery images from S3
  if (destination.photoGallery.length > 0) {
    await deleteImagesFromS3(destination.photoGallery);
  }

  // 6 : Send response
  return null;
};

export {
  createDestinationService,
  getDestinationsService,
  getDestinationByIdService,
  updateDestinationService,
  deleteDestinationService,
};
