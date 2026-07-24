import { Router } from "express";
import {
  createFood,
  getFoods,
  getFoodById,
  updateFood,
  deleteFood,
  updateFoodFeaturedStatus,
  updateFoodIndexableStatus,
} from "@src/controllers/foodController";
import validation from "@src/middlewares/validation";
import validateObjectId from "@src/middlewares/validateObjectId";
import { protect } from "@src/middlewares/protect";
import { restrictTo } from "@src/middlewares/restrictTo";
import { Role } from "@src/models/userModel";
import {
  createFoodSchema,
  updateFoodSchema,
  updateFeaturedStatusSchema,
  updateIndexableStatusSchema,
  getFoodsQuerySchema,
} from "@src/validations/foodValidations";

const foodRouter = Router();

foodRouter.post(
  "/",
  protect,
  restrictTo(Role.Admin),
  validation(createFoodSchema, "body"),
  createFood,
);
foodRouter.get("/", validation(getFoodsQuerySchema, "query"), getFoods);
foodRouter.get("/:id", validateObjectId(), getFoodById);
foodRouter.patch(
  "/:id",
  protect,
  restrictTo(Role.Admin),
  validateObjectId(),
  validation(updateFoodSchema, "body"),
  updateFood,
);
foodRouter.delete(
  "/:id",
  protect,
  restrictTo(Role.Admin),
  validateObjectId(),
  deleteFood,
);
foodRouter.patch(
  "/:id/featured-status",
  protect,
  restrictTo(Role.Admin),
  validateObjectId(),
  validation(updateFeaturedStatusSchema, "body"),
  updateFoodFeaturedStatus,
);
foodRouter.patch(
  "/:id/indexable-status",
  protect,
  restrictTo(Role.Admin),
  validateObjectId(),
  validation(updateIndexableStatusSchema, "body"),
  updateFoodIndexableStatus,
);

export default foodRouter;
