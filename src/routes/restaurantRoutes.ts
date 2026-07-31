import { Router } from "express";
import {
  createRestaurant,
  getRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
  updateRestaurantFeaturedStatus,
  updateRestaurantIndexableStatus,
} from "@src/controllers/restaurantController";
import validation from "@src/middlewares/validation";
import validateObjectId from "@src/middlewares/validateObjectId";
import { protect } from "@src/middlewares/protect";
import { restrictTo } from "@src/middlewares/restrictTo";
import { Role } from "@src/models/userModel";
import {
  createRestaurantSchema,
  updateRestaurantSchema,
  updateFeaturedStatusSchema,
  updateIndexableStatusSchema,
  getRestaurantsQuerySchema,
} from "@src/validations/restaurantValidations";

const restaurantRouter = Router();

restaurantRouter.post(
  "/",
  protect,
  restrictTo(Role.SuperAdmin, Role.Admin),
  validation(createRestaurantSchema, "body"),
  createRestaurant,
);
restaurantRouter.get(
  "/",
  validation(getRestaurantsQuerySchema, "query"),
  getRestaurants,
);
restaurantRouter.get("/:id", validateObjectId(), getRestaurantById);
restaurantRouter.patch(
  "/:id",
  protect,
  restrictTo(Role.SuperAdmin, Role.Admin),
  validateObjectId(),
  validation(updateRestaurantSchema, "body"),
  updateRestaurant,
);
restaurantRouter.delete(
  "/:id",
  protect,
  restrictTo(Role.SuperAdmin, Role.Admin),
  validateObjectId(),
  deleteRestaurant,
);
restaurantRouter.patch(
  "/:id/featured-status",
  protect,
  restrictTo(Role.SuperAdmin, Role.Admin),
  validateObjectId(),
  validation(updateFeaturedStatusSchema, "body"),
  updateRestaurantFeaturedStatus,
);
restaurantRouter.patch(
  "/:id/indexable-status",
  protect,
  restrictTo(Role.SuperAdmin, Role.Admin),
  validateObjectId(),
  validation(updateIndexableStatusSchema, "body"),
  updateRestaurantIndexableStatus,
);

export default restaurantRouter;
