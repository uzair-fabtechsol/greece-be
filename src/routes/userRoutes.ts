import { Router } from "express";
import { getUsers, getUserById } from "@src/controllers/userController";
import validation from "@src/middlewares/validation";
import validateObjectId from "@src/middlewares/validateObjectId";
import { protect } from "@src/middlewares/protect";
import { restrictTo } from "@src/middlewares/restrictTo";
import { Role } from "@src/models/userModel";
import { getUsersQuerySchema } from "@src/validations/userValidations";

const userRouter = Router();

userRouter.get(
  "/",
  protect,
  restrictTo(Role.Admin),
  validation(getUsersQuerySchema, "query"),
  getUsers,
);
userRouter.get(
  "/:id",
  protect,
  restrictTo(Role.Admin),
  validateObjectId(),
  getUserById,
);

export default userRouter;
