import { Types, type PipelineStage } from "mongoose";
import ActivityModel from "@src/models/activityModel";
import { deleteImagesFromS3 } from "@src/services/s3Services";
import AppError from "@src/utils/appError";
import { generateUniqueSlug } from "@src/utils/slug";
import { resolveReference } from "@src/utils/resolveReference";
import APIFeatures from "@src/utils/apiFeatures";
import type {
  CreateActivityBody,
  UpdateActivityBody,
  GetActivitiesQuery,
} from "@src/types/activityTypes";

// FUNCTION
const createActivityService = async (body: CreateActivityBody) => {
  // 1 : Verify whichever single reference was submitted actually exists
  const reference = await resolveReference(body);

  // 2 : Generate a unique slug from the activity name
  const slug = await generateUniqueSlug(ActivityModel, body.name);

  // 3 : Create the activity in the database
  const activity = await ActivityModel.create({
    ...body,
    ...reference,
    slug,
  });

  // 4 : Send response
  return { activity };
};

// FUNCTION
const getActivitiesService = async (query: GetActivitiesQuery) => {
  // 1 : The three reference filters need ObjectId casting before they can be matched
  const filterQuery = {
    ...query,
    region: query.region ? new Types.ObjectId(query.region) : undefined,
    destination: query.destination
      ? new Types.ObjectId(query.destination)
      : undefined,
    place: query.place ? new Types.ObjectId(query.place) : undefined,
  };

  // 2 : Activities carry no joined references, so there are no base stages
  const basePipeline: PipelineStage[] = [];

  // 3 : Build and run the aggregation pipeline to get the page of results
  // and the total count in one round trip
  const { data: activities, pagination } = await new APIFeatures(
    ActivityModel,
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
  return { activities, pagination };
};

// FUNCTION
const getActivityByIdService = async (id: string) => {
  // 1 : Fetch the activity
  const activity = await ActivityModel.findById(id);
  if (!activity) {
    throw new AppError(404, "Activity not found");
  }

  // 2 : Send response
  return { activity };
};

// FUNCTION
const updateActivityService = async (id: string, body: UpdateActivityBody) => {
  // 1 : Find the activity to update
  const activity = await ActivityModel.findById(id);
  if (!activity) {
    throw new AppError(404, "Activity not found");
  }

  // 2 : If the reference is being changed, verify the new one exists and
  // drop whichever reference was previously set
  const reference =
    body.region || body.destination || body.place
      ? await resolveReference(body)
      : null;

  const previousPhotoGallery = activity.photoGallery;

  // 3 : Regenerate the slug if the name is changing
  if (body.name && body.name !== activity.name) {
    activity.slug = await generateUniqueSlug(
      ActivityModel,
      body.name,
      activity._id.toString(),
    );
  }

  // 4 : Apply the update and persist it
  Object.assign(activity, body, reference ?? {});
  await activity.save();

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
  return { activity };
};

// FUNCTION
const deleteActivityService = async (id: string) => {
  // 1 : Find the activity to delete
  const activity = await ActivityModel.findById(id);
  if (!activity) {
    throw new AppError(404, "Activity not found");
  }

  // 2 : Delete the activity
  await activity.deleteOne();

  // 3 : Clean up its photo gallery images from S3
  if (activity.photoGallery.length > 0) {
    await deleteImagesFromS3(activity.photoGallery);
  }

  // 4 : Send response
  return null;
};

export {
  createActivityService,
  getActivitiesService,
  getActivityByIdService,
  updateActivityService,
  deleteActivityService,
};
