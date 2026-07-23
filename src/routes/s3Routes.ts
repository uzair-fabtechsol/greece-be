import { Router } from "express";
import { getPresignedUrl } from "@src/controllers/s3Controller";
import validation from "@src/middlewares/validation";
import { protect } from "@src/middlewares/protect";
import { restrictTo } from "@src/middlewares/restrictTo";
import { Role } from "@src/models/userModel";
import { getPresignedUrlSchema } from "@src/validations/s3Validations";

const s3Router = Router();

s3Router.post(
  "/presign-url",
  protect,
  restrictTo(Role.Admin),
  validation(getPresignedUrlSchema, "body"),
  getPresignedUrl,
);

export default s3Router;
