import type { NextFunction, Request, Response } from "express";
import AppError from "@src/utils/appError";
import { Role } from "@src/models/userModel";

// FUNCTION
const restrictTo = (...roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role as Role)) {
      next(new AppError(403, "You do not have permission to perform this action"));
      return;
    }

    next();
  };
};

export { restrictTo };
