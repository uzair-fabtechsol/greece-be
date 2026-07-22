import type { NextFunction, Request, Response } from "express";
import AppError from "@src/utils/appError";
import { verifyAccessToken } from "@src/utils/authUtils";
import { ACCESS_TOKEN_COOKIE_NAME } from "@src/constants/authConstants";

// FUNCTION
const protect = (req: Request, _res: Response, next: NextFunction): void => {
  // 1 : Read the access token from the cookie
  const token = req.cookies?.[ACCESS_TOKEN_COOKIE_NAME] as string | undefined;
  if (!token) {
    next(new AppError(401, "You are not logged in. Please log in to access this resource"));
    return;
  }

  // 2 : Verify the token and attach the user to the request
  try {
    const payload = verifyAccessToken(token);
    req.user = { _id: payload.id, role: payload.role };
    next();
  } catch {
    next(new AppError(401, "Invalid or expired session. Please log in again"));
  }
};

export { protect };
