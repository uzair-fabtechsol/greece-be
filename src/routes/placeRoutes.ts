import { Router } from "express";
import {
  createPlace,
  getPlaces,
  getPlaceById,
  updatePlace,
  deletePlace,
} from "@src/controllers/placeController";
import validation from "@src/middlewares/validation";
import validateObjectId from "@src/middlewares/validateObjectId";
import { protect } from "@src/middlewares/protect";
import { restrictTo } from "@src/middlewares/restrictTo";
import { Role } from "@src/models/userModel";
import {
  createPlaceSchema,
  updatePlaceSchema,
  getPlacesQuerySchema,
} from "@src/validations/placeValidations";

const placeRouter = Router();

placeRouter.post(
  "/",
  protect,
  restrictTo(Role.Admin),
  validation(createPlaceSchema, "body"),
  createPlace,
);
placeRouter.get("/", validation(getPlacesQuerySchema, "query"), getPlaces);
placeRouter.get("/:id", validateObjectId(), getPlaceById);
placeRouter.patch(
  "/:id",
  protect,
  restrictTo(Role.Admin),
  validateObjectId(),
  validation(updatePlaceSchema, "body"),
  updatePlace,
);
placeRouter.delete(
  "/:id",
  protect,
  restrictTo(Role.Admin),
  validateObjectId(),
  deletePlace,
);

export default placeRouter;
