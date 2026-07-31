import type { Request, Response, NextFunction, RequestHandler } from "express";
import type { ZodSchema } from "zod";
import AppError from "@src/utils/appError";

type ValidationSource = "body" | "query" | "params";

// FUNCTION
const validation = (
  schema: ZodSchema,
  source: ValidationSource,
): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      next(new AppError(400, "Validation failed", { errors }));
      return;
    }

    if (source === "body") {
      // req.body is writable, so the validated data could be assigned back
      // onto it. It is kept separate anyway so that all three sources land
      // under the same validated* convention, and so req.body always means
      // "raw, as parsed off the wire".
      req.validatedBody = result.data as Record<string, unknown>;
    } else if (source === "query") {
      // req.query is a getter in Express 5 that re-parses req.url on every
      // access, so mutating/reassigning it does not persist. Store the
      // validated data separately instead.
      req.validatedQuery = result.data as Record<string, unknown>;
    } else {
      req.validatedParams = result.data as Record<string, unknown>;
    }

    next();
  };
};

export default validation;
