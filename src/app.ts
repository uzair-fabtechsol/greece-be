import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import { clean as xssClean } from "xss-clean/lib/xss";
import hpp from "hpp";
import AppError from "@src/utils/appError";
import globalErrorHandler from "@src/controllers/errorController";
import sendResponse from "@src/utils/sendResponse";
import authRouter from "@src/routes/authRoutes";

// ─── Process-level Safety Nets ────────────────────────────────────────────────

process.on("uncaughtException", (err: Error) => {
  console.error("UNCAUGHT EXCEPTION! Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

process.on("unhandledRejection", (err: Error) => {
  console.error("UNHANDLED REJECTION! Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

// ─── App ──────────────────────────────────────────────────────────────────────

const app = express();

app.use(morgan("dev"));

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));

// Cookie parser, reading cookies into req.cookies
app.use(cookieParser());

// ─── Security Middleware ──────────────────────────────────────────────────────

// Data sanitization against NoSQL query injection
// NOTE: express-mongo-sanitize's own middleware reassigns req.query, which
// Express 5 exposes as a read-only getter and throws on. Its sanitize()
// helper mutates the given object in place, so we call it directly per
// target instead of using the package's middleware wrapper.
app.use((req, _res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.query) mongoSanitize.sanitize(req.query);
  if (req.params) mongoSanitize.sanitize(req.params);
  if (req.headers) mongoSanitize.sanitize(req.headers);
  next();
});

// Data sanitization against XSS
// NOTE: xss-clean's clean() returns a brand-new object rather than mutating
// in place. Reassigning req.body/req.params is fine, but req.query is
// read-only in Express 5, so string values are cleaned and written back
// onto the existing object/array instead of replacing the reference.
app.use((req, _res, next) => {
  const sanitizeObject = (obj: Record<string, unknown> | undefined) => {
    if (!obj) return;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        if (typeof value === "string") {
          obj[key] = xssClean(value);
        } else if (typeof value === "object" && value !== null) {
          sanitizeObject(value as Record<string, unknown>);
        }
      }
    }
  };

  sanitizeObject(req.body);
  sanitizeObject(req.query);
  sanitizeObject(req.params);
  sanitizeObject(req.headers);

  next();
});

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      // Add fields here that are allowed to have duplicate parameters in the query string
    ],
  }),
);

// Set security HTTP headers
app.use(helmet());

const limiter = rateLimit({
  max: 500, // Limit each IP to 500 requests per windowMs
  windowMs: 60 * 60 * 1000, // 1 hour
  message: "Too many requests from this IP, please try again in an hour!",
});

app.use("/api", limiter);

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get("/health", (_req: Request, res: Response) => {
  sendResponse(res, 200, {
    status: "success",
    message: "greece-be backend is running",
    data: null,
  });
});

app.use("/api/v1/auth", authRouter);

// ─── Unhandled Routes ─────────────────────────────────────────────────────────

app.all(
  "/{*splat}",
  (req: Request, _res: Response, next: NextFunction): void => {
    next(
      new AppError(
        404,
        `Cannot find ${req.method} ${req.originalUrl} on this server`,
      ),
    );
  },
);

// ─── Global Error Handler (must be last) ──────────────────────────────────────

app.use(globalErrorHandler);

export default app;
