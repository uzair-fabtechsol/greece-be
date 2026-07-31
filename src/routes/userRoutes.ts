import { Router } from "express";
import {
  createUser,
  getUsers,
  getUserById,
} from "@src/controllers/userController";
import validation from "@src/middlewares/validation";
import validateObjectId from "@src/middlewares/validateObjectId";
import { protect } from "@src/middlewares/protect";
import { restrictTo } from "@src/middlewares/restrictTo";
import { Role } from "@src/models/userModel";
import {
  createUserSchema,
  getUsersQuerySchema,
} from "@src/validations/userValidations";

const userRouter = Router();

// Only a superAdmin can mint admins, so this route deliberately does not
// include Role.Admin the way the read routes below do
userRouter.post(
  "/",
  protect,
  restrictTo(Role.SuperAdmin),
  validation(createUserSchema, "body"),
  createUser,
);
userRouter.get(
  "/",
  protect,
  restrictTo(Role.SuperAdmin, Role.Admin),
  validation(getUsersQuerySchema, "query"),
  getUsers,
);
userRouter.get(
  "/:id",
  protect,
  restrictTo(Role.SuperAdmin, Role.Admin),
  validateObjectId(),
  getUserById,
);

export default userRouter;
