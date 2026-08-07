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
import {
  createTripSchema,
  updateTripSchema,
  getTripsQuerySchema,
} from "@src/validations/tripValidation";

const tripRouter = Router();

tripRouter.post(
  "/",
  protect,
  validation(createTripSchema, "body"),
  createTrip,
);
tripRouter.get("/", protect, validation(getTripsQuerySchema, "query"), getTrips);
tripRouter.get("/:id", protect, validateObjectId(), getTripById);
tripRouter.patch(
  "/:id",
  protect,
  validateObjectId(),
  validation(updateTripSchema, "body"),
  updateTrip,
);
tripRouter.delete("/:id", protect, validateObjectId(), deleteTrip);

export default tripRouter;
