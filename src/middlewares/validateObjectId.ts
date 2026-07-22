import type { RequestHandler } from "express";
import { isValidObjectId } from "mongoose";
import AppError from "@src/utils/appError";

const validateObjectId = (paramName = "id"): RequestHandler => {
  return (req, _res, next) => {
    const value = req.params[paramName];

    if (!isValidObjectId(value)) {
      next(new AppError(400, `Invalid ${paramName}`));
      return;
    }

    next();
  };
};

export default validateObjectId;
