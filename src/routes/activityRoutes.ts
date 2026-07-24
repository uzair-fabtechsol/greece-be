import { Router } from "express";
import {
  createActivity,
  getActivities,
  getActivityById,
  updateActivity,
  deleteActivity,
} from "@src/controllers/activityController";
import validation from "@src/middlewares/validation";
import validateObjectId from "@src/middlewares/validateObjectId";
import { protect } from "@src/middlewares/protect";
import { restrictTo } from "@src/middlewares/restrictTo";
import { Role } from "@src/models/userModel";
import {
  createActivitySchema,
  updateActivitySchema,
  getActivitiesQuerySchema,
} from "@src/validations/activityValidations";

const activityRouter = Router();

activityRouter.post(
  "/",
  protect,
  restrictTo(Role.Admin),
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
  restrictTo(Role.Admin),
  validateObjectId(),
  validation(updateActivitySchema, "body"),
  updateActivity,
);
activityRouter.delete(
  "/:id",
  protect,
  restrictTo(Role.Admin),
  validateObjectId(),
  deleteActivity,
);

export default activityRouter;
