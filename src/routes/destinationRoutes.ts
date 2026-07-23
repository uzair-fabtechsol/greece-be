import { Router } from "express";
import {
  createDestination,
  getDestinations,
  getDestinationById,
  updateDestination,
  deleteDestination,
} from "@src/controllers/destinationController";
import validation from "@src/middlewares/validation";
import validateObjectId from "@src/middlewares/validateObjectId";
import { protect } from "@src/middlewares/protect";
import { restrictTo } from "@src/middlewares/restrictTo";
import { Role } from "@src/models/userModel";
import {
  createDestinationSchema,
  updateDestinationSchema,
  getDestinationsQuerySchema,
} from "@src/validations/destinationValidations";

const destinationRouter = Router();

destinationRouter.post(
  "/",
  protect,
  restrictTo(Role.Admin),
  validation(createDestinationSchema, "body"),
  createDestination,
);
destinationRouter.get(
  "/",
  validation(getDestinationsQuerySchema, "query"),
  getDestinations,
);
destinationRouter.get("/:id", validateObjectId(), getDestinationById);
destinationRouter.patch(
  "/:id",
  protect,
  restrictTo(Role.Admin),
  validateObjectId(),
  validation(updateDestinationSchema, "body"),
  updateDestination,
);
destinationRouter.delete(
  "/:id",
  protect,
  restrictTo(Role.Admin),
  validateObjectId(),
  deleteDestination,
);

export default destinationRouter;
