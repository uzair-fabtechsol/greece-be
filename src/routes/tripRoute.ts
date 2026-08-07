import { Router } from "express";
import {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  deleteTrip,
} from "@src/controllers/tripController";
import validation from "@src/middlewares/validation";
import validateObjectId from "@src/middlewares/validateObjectId";
import { protect } from "@src/middlewares/protect";
import { restrictTo } from "@src/middlewares/restrictTo";
import { Role } from "@src/models/userModel";
import {
  createTripSchema,
  updateTripSchema,
  getTripsQuerySchema,
} from "@src/validations/tripValidation";

const tripRouter = Router();

tripRouter.post(
  "/",
  protect,
  restrictTo(Role.Traveller),
  validation(createTripSchema, "body"),
  createTrip,
);
tripRouter.get(
  "/",
  protect,
  restrictTo(Role.SuperAdmin, Role.Admin, Role.Traveller),
  validation(getTripsQuerySchema, "query"),
  getTrips,
);
tripRouter.get(
  "/:id",
  protect,
  restrictTo(Role.SuperAdmin, Role.Admin, Role.Traveller),
  validateObjectId(),
  getTripById,
);
tripRouter.patch(
  "/:id",
  protect,
  restrictTo(Role.SuperAdmin, Role.Admin, Role.Traveller),
  validateObjectId(),
  validation(updateTripSchema, "body"),
  updateTrip,
);
tripRouter.delete(
  "/:id",
  protect,
  restrictTo(Role.SuperAdmin, Role.Admin, Role.Traveller),
  validateObjectId(),
  deleteTrip,
);

export default tripRouter;
