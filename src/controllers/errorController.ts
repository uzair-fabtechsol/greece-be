import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import AppError from "@src/utils/appError";
import sendResponse from "@src/utils/sendResponse";

const handleCastError = (err: mongoose.Error.CastError): AppError => {
  return new AppError(400, `Invalid ${err.path}: ${err.value}`);
};

const handleDuplicateKeyError = (err: { keyValue?: Record<string, unknown> }): AppError => {
  const field = err.keyValue ? Object.keys(err.keyValue)[0] : "field";
  return new AppError(400, `Duplicate value for field: ${field}`);
};

const handleMongooseValidationError = (
  err: mongoose.Error.ValidationError,
): AppError => {
  const errors = Object.values(err.errors).map((e) => ({
    field: e.path,
    message: e.message,
  }));
  return new AppError(400, "Validation failed", { errors });
};

const globalErrorHandler = (
  err: Error & { code?: number },
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let error: AppError;

  if (err instanceof mongoose.Error.CastError) {
    error = handleCastError(err);
  } else if (err.code === 11000) {
    error = handleDuplicateKeyError(err as { keyValue?: Record<string, unknown> });
  } else if (err instanceof mongoose.Error.ValidationError) {
    error = handleMongooseValidationError(err);
  } else if (err instanceof AppError) {
    error = err;
  } else {
    console.error("PROGRAMMING ERROR:", err);
    error = new AppError(500, "Something went wrong. Please try again later.");
  }

  sendResponse(res, error.statusCode, {
    status: error.status,
    message: error.message,
    data: error.data,
  });
};

export default globalErrorHandler;
