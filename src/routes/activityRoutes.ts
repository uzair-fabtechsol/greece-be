import { Router } from "express";
import {
  createActivity,
  getActivities,
  getActivityById,
  updateActivity,
  deleteActivity,
  updateActivityFeaturedStatus,
  updateActivityIndexableStatus,
} from "@src/controllers/activityController";
import validation from "@src/middlewares/validation";
import validateObjectId from "@src/middlewares/validateObjectId";
import { protect } from "@src/middlewares/protect";
import { restrictTo } from "@src/middlewares/restrictTo";
import { Role } from "@src/models/userModel";
import {
  createActivitySchema,
  updateActivitySchema,
  updateFeaturedStatusSchema,
  updateIndexableStatusSchema,
  getActivitiesQuerySchema,
} from "@src/validations/activityValidations";

const activityRouter = Router();

activityRouter.post(
  "/",
  protect,
  restrictTo(Role.SuperAdmin, Role.Admin),
  validation(createActivitySchema, "body"),
  createActivity,
);
activityRouter.get(
  "/",
  validation(getActivitiesQuerySchema, "query"),
  getActivities,
);
activityRouter.get("/:id", validateObjectId(), getActivityById);
activityRouter.patch(
  "/:id",
  protect,
  restrictTo(Role.SuperAdmin, Role.Admin),
  validateObjectId(),
  validation(updateActivitySchema, "body"),
  updateActivity,
);
activityRouter.delete(
  "/:id",
  protect,
  restrictTo(Role.SuperAdmin, Role.Admin),
  validateObjectId(),
  deleteActivity,
);
activityRouter.patch(
  "/:id/featured-status",
  protect,
  restrictTo(Role.SuperAdmin, Role.Admin),
  validateObjectId(),
  validation(updateFeaturedStatusSchema, "body"),
  updateActivityFeaturedStatus,
);
activityRouter.patch(
  "/:id/indexable-status",
  protect,
  restrictTo(Role.SuperAdmin, Role.Admin),
  validateObjectId(),
  validation(updateIndexableStatusSchema, "body"),
  updateActivityIndexableStatus,
);

export default activityRouter;
