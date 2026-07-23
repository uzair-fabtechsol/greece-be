import { Router } from "express";
import {
  createRegion,
  getRegions,
  getRegionById,
  updateRegion,
  deleteRegion,
} from "@src/controllers/regionController";
import validation from "@src/middlewares/validation";
import validateObjectId from "@src/middlewares/validateObjectId";
import { protect } from "@src/middlewares/protect";
import { restrictTo } from "@src/middlewares/restrictTo";
import { Role } from "@src/models/userModel";
import {
  createRegionSchema,
  updateRegionSchema,
  getRegionsQuerySchema,
} from "@src/validations/regionValidations";

const regionRouter = Router();

regionRouter.post(
  "/",
  protect,
  restrictTo(Role.Admin),
  validation(createRegionSchema, "body"),
  createRegion,
);
regionRouter.get("/", validation(getRegionsQuerySchema, "query"), getRegions);
regionRouter.get("/:id", validateObjectId(), getRegionById);
regionRouter.patch(
  "/:id",
  protect,
  restrictTo(Role.Admin),
  validateObjectId(),
  validation(updateRegionSchema, "body"),
  updateRegion,
);
regionRouter.delete(
  "/:id",
  protect,
  restrictTo(Role.Admin),
  validateObjectId(),
  deleteRegion,
);

export default regionRouter;
