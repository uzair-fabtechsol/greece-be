import { Types, type PipelineStage } from "mongoose";
import DestinationModel from "@src/models/destinationModel";
import RegionModel from "@src/models/regionModel";
import { deleteImagesFromS3 } from "@src/services/s3Services";
import AppError from "@src/utils/appError";
import { generateUniqueSlug } from "@src/utils/slug";
import type {
  CreateDestinationBody,
  UpdateDestinationBody,
  GetDestinationsQuery,
} from "@src/types/destinationTypes";
import type { Pagination } from "@src/utils/sendResponse";

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
  // 1 : Extract filters, sorting, and pagination options from the query
  const { search, page, limit, sortBy, sortOrder, type, status, bestSeason, region } =
    query;

  // 2 : Build the match stage from the provided filters
  const match: Record<string, unknown> = {};

  if (status) match.status = status;
  if (type) match.type = type;
  if (bestSeason) match["quickFacts.bestSeason"] = bestSeason;
  if (region) match.region = new Types.ObjectId(region);
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
        data: [
          { $skip: skip },
          { $limit: limit },
          ...regionLookupStages,
        ],
        totalCount: [{ $count: "count" }],
      },
    },
  ];

  const [result] = await DestinationModel.aggregate(pipeline);
  const destinations = result?.data ?? [];
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
  return { destinations, pagination };
};

// FUNCTION
const getDestinationByIdService = async (id: string) => {
  // 1 : Fetch the destination with its region populated as regionDetails
  const pipeline: PipelineStage[] = [
    { $match: { _id: new Types.ObjectId(id) } },
    ...regionLookupStages,
  ];

  const [destination] = await DestinationModel.aggregate(pipeline);
  if (!destination) {
    throw new AppError(404, "Destination not found");
  }

  // 2 : Send response
  return { destination };
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

export {
  createDestinationService,
  getDestinationsService,
  getDestinationByIdService,
  updateDestinationService,
};
