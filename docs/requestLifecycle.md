# API Request Lifecycle

This document explains how an HTTP request flows through the **greece-be** backend from the moment it arrives until a response is sent back.

---

## Overview

Every request passes through these layers in order:

```
HTTP Request
     │
     ▼
  Router  ──►  Validation Middleware  ──►  Controller (catchAsync)  ──►  Service
                      │                          │                          │
                      │ (fail)                   │ (throws AppError)        │ (throws AppError)
                      ▼                          ▼                          ▼
               Global Error Handler ◄───────────────────────────────────────
                      │
                      ▼
               HTTP Response (JSON)
```

---

## 1. Router

**File:** [`src/routes/authRoutes.ts`](../src/routes/authRoutes.ts)

The router is the entry point. It maps an HTTP method + path to a chain of middleware and a controller. Validation middleware is always placed **before** the controller.

```ts
authRouter.post("/signup", validationMiddleware(signupSchema), signup);
//                          └─── runs first ───┘  └─── runs second ───┘
```

- The router itself does nothing beyond wiring — no business logic lives here.
- Multiple middleware can be chained; they run **left to right**.

### Authorization Chain (every protected resource)

Every route that requires a logged-in user follows this exact middleware order, established for `users` and repeated for every future resource (patients, doctors, appointments, billing, etc.):

```ts
userRouter.patch(
  "/:id",
  protectMiddleware,                      // 1. verifies the access-token cookie, attaches req.user
  hasPermissionMiddleware("users", "edit"), // 2. admin bypasses; receptionist needs this resource+action
  validateObjectIdMiddleware(),           // 3. rejects a malformed :id before it reaches the DB
  validationMiddleware(updateUserSchema), // 4. validates req.body
  updateUser,                             // 5. controller
);
```

- **`protectMiddleware`** (`src/middlewares/protectMiddleware.ts`) — reads the `accessToken` cookie, verifies it, loads the user, and attaches `req.user = { _id, role, permissions }`.
- **`hasPermissionMiddleware(resource, action)`** (`src/middlewares/hasPermissionMiddleware.ts`) — generic, resource-agnostic. `role === "admin"` always passes. Otherwise it checks `req.user.permissions` for an entry where `resource` matches and `actions` includes the given action. `resource` and `action` must be values from `src/constants/userConstants.ts` (`RESOURCES` / `ACTIONS`).
- **`validateObjectIdMiddleware(paramName?)`** (`src/middlewares/validateObjectIdMiddleware.ts`) — generic, resource-agnostic. Rejects any `:id`-shaped route param that isn't a valid Mongo ObjectId with a 400, before a bad id ever reaches a service/DB call.

This authorization chain is the standard for CRUD on any resource — not just users.

---

## 2. Validation Middleware

**File:** [`src/middlewares/validationMiddleware.ts`](../src/middlewares/validationMiddleware.ts)

Validates `req.body` against a **Zod schema** before the request ever reaches the controller.

```ts
const validationMiddleware = (schema: ZodSchema): RequestHandler => {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      // ❌ Validation failed — build an error list and pass to error handler
      const errors = result.error.issues.map((iss) => ({
        field: iss.path.join("."),
        message: iss.message,
      }));
      next(new AppError(400, "Validation failed", { errors }));
      return;
    }

    // ✅ Validation passed — replace req.body with the safe, parsed data
    req.body = result.data;
    next();
  };
};
```

**Key points:**
- Uses `schema.safeParse()` — never throws, always returns `{ success, data | error }`.
- On failure, it calls `next(error)` which **skips all remaining middleware** and jumps straight to the Global Error Handler.
- On success, it replaces `req.body` with the **parsed & typed** data, stripping any unknown fields automatically.

The Zod schemas live in [`src/validations/`](../src/validations/).

### Validating `req.query`

`validationMiddleware` takes an optional second argument, `target: "body" | "query"` (defaults to `"body"`):

```ts
userRouter.get(
  "/",
  validationMiddleware(getUsersQuerySchema, "query"),
  getUsers,
);
```

Express 5 makes `req.query` a **read-only getter** — it cannot be reassigned. So when `target` is `"query"`, the parsed result is stored on **`req.validatedQuery`** instead of `req.query`. Controllers for query-validated routes must read from `req.validatedQuery`, not `req.query`:

```ts
const query = req.validatedQuery as GetUsersQuery;
```

---

## 3. Controller

**File:** [`src/controllers/authController.ts`](../src/controllers/authController.ts)

The controller is a **thin orchestration layer**. It reads from the request, calls the service, and sends the response. It contains no business logic.

Every controller is wrapped in `catchAsync`:

```ts
export const signup = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const body = req.body as SignupBody; // already validated & typed by middleware

    const data = await signupService(body); // delegates business logic to the service and captures result

    sendResponse(res, 201, {             // sends the success response
      status: "success",
      message: "Signup successful",
      data,                              // injects the service's returned data
    });
  },
);
```

**Rule:** Controllers only do three things:
1. Read from `req` (body, params, query, user)
2. Call one or more service functions and capture their returned data
3. Call `sendResponse` and pass the data along

**Extracting data for the service:** Anything a service needs — `req.user`, `req.params`, `req.query`, etc. — must be pulled out in the controller and passed to the service as an explicit function argument. The service function signature should never receive `req` itself.

```ts
export const updateProfile = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const body = req.body as UpdateProfileBody;
    const userId = req.user!._id;       // pulled out here, not inside the service

    const data = await updateProfileService(userId, body);

    sendResponse(res, 200, {
      status: "success",
      message: "Profile updated",
      data,
    });
  },
);
```

---

## 4. `catchAsync` Utility

**File:** [`src/utils/catchAsync.ts`](../src/utils/catchAsync.ts)

A tiny wrapper that eliminates the need for `try/catch` in every async controller.

```ts
const catchAsync = (fn): RequestHandler => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); // any thrown error is forwarded to Express error handler
  };
};
```

Without `catchAsync`, an unhandled promise rejection in a controller would crash the server. With it, any `throw` or rejected `await` inside the controller is automatically caught and passed to `next(error)`, routing it to the Global Error Handler.

---

## 5. Service

**File:** [`src/services/authServices.ts`](../src/services/authServices.ts)

The service contains all **business logic** — database queries, password hashing, token generation, etc. It knows nothing about `req` or `res`.

```ts
export const signupService = async (body: SignupBody): Promise<any> => {
  // business logic: validate uniqueness, hash password, create user, etc.

  // To signal a known failure, throw an AppError:
  throw new AppError(400, "Email already in use");

  // Otherwise, return any data that should be sent in the response:
  return { user: newUser };
};
```

**Key points:**
- Services only receive plain data (no Express objects) — never `req`, `res`, or `next`.
- If a service needs something that lives on `req` (e.g. the logged-in user's id from `req.user`, a route param from `req.params`), the controller extracts it and passes it as its own explicit argument. A service function never destructures or reads `req.user`, `req.params`, `req.query`, etc. directly — doing so is a lifecycle violation, even if `req` were technically in scope.
- They throw `AppError` for **expected failures** (e.g. duplicate email, not found).
- They let unexpected errors bubble up naturally (e.g. a DB connection failure).
- They **return data**, which the controller receives and places in the HTTP response.

### List Endpoints: Aggregation Pipeline Is the Default

**File:** [`src/services/userServices.ts`](../src/services/userServices.ts) (`getUsersService`)

Any endpoint that fetches **multiple records** — with pagination, search, and/or filtering — is built with a Mongoose **aggregation pipeline**, not chained query builder calls (`.find().skip().limit()`). This applies to every current and future list endpoint (users, patients, doctors, appointments, etc.), not just this one.

Use a single aggregation with `$facet` to get the page of results and the total count in **one round trip**:

```ts
const [result] = await UserModel.aggregate([
  { $match: match },              // role filter / search, built from the query params
  { $project: { password: 0 } },  // strip sensitive fields
  {
    $facet: {
      users: [
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ],
      totalCount: [{ $count: "count" }],
    },
  },
]);
```

**Why aggregation over simple queries:** it lets filtering, search, sorting, pagination, and count all happen inside MongoDB in a single query, and it scales cleanly as list endpoints grow more complex (joins via `$lookup`, computed fields, grouping) without ever needing to switch strategies later.

**Search:** always escape user-supplied search strings before building a `$regex` (see [`src/utils/escapeRegex.ts`](../src/utils/escapeRegex.ts)) to avoid regex injection / ReDoS.

---

## 6. `AppError` Class

**File:** [`src/utils/appError.ts`](../src/utils/appError.ts)

A custom error class used to distinguish **operational errors** (expected, safe to show the client) from **programming errors** (bugs, should never reach the client).

```ts
class AppError extends Error {
  statusCode: number;
  status: "fail" | "error";  // "fail" for 4xx, "error" for 5xx
  isOperational: boolean;    // always true — marks it as a known error
  data: unknown;             // optional extra context (e.g. validation error list)

  constructor(statusCode: number, message: string, data: unknown = null) { ... }
}
```

**When to use `AppError`:**
- User does something wrong → `new AppError(400, "...")` or `404`, `401`, `403`, etc.
- Never use it for unexpected programming bugs — just let those throw normally.

---

## 7. Global Error Handler

**File:** [`src/controllers/errorController.ts`](../src/controllers/errorController.ts)

Registered last in `app.ts` via `app.use(globalErrorHandler)`. Express routes any error passed to `next(err)` here.

```ts
const globalErrorHandler = (err, _req, res, _next): void => {
  let error: AppError;

  // Convert known Mongoose / MongoDB errors into AppErrors
  if (err instanceof mongoose.Error.CastError) {
    error = handleCastError(err);                // e.g. bad ObjectId
  } else if (err.code === 11000) {
    error = handleDuplicateKeyError(err);        // e.g. duplicate email
  } else if (err instanceof mongoose.Error.ValidationError) {
    error = handleMongooseValidationError(err);  // Mongoose schema validation
  } else if (err instanceof AppError) {
    error = err;                                 // already an operational error
  } else {
    // Unknown programming error — log it, don't leak details
    console.error("PROGRAMMING ERROR:", err);
    error = new AppError(500, "Something went wrong. Please try again later.");
  }

  sendResponse(res, error.statusCode, {
    status: error.status,
    message: error.message,
    data: error.data,
  });
};
```

**Key points:**
- It **must** have exactly 4 parameters `(err, req, res, next)` — Express uses this signature to identify it as an error handler.
- It normalizes all error types into a consistent `AppError` before responding.
- Programming errors (bugs) are logged server-side but return a generic 500 to the client.

---

## 8. `sendResponse` Utility

**File:** [`src/utils/sendResponse.ts`](../src/utils/sendResponse.ts)

A tiny helper that enforces a consistent JSON response shape across the entire API.

```ts
sendResponse(res, statusCode, {
  status: "success" | "fail" | "error",
  message: string,
  data: unknown, // always an object — e.g. { instructors }, { instructor }, { instructors, pagination }
});
```

Every response from this API — success or error — follows this same shape. `data` is always an **enveloped object** with named key(s), never a bare array or primitive (e.g. `data: { instructors }` rather than `data: instructors`).

### Error Envelope Shape

Error responses follow the same enveloping rule. When an `AppError` carries extra context (e.g. field-level validation failures), it goes in `data.errors` — never as a bare array or as `data` itself:

```json
{
  "status": "fail",
  "message": "Validation failed",
  "data": {
    "errors": [
      { "field": "email", "message": "Invalid email address" }
    ]
  }
}
```

When an `AppError` carries no extra context, `data` is `null` (there is nothing to envelope) — it is still never a bare string or array.

### Pagination Shape

**File:** [`src/utils/sendResponse.ts`](../src/utils/sendResponse.ts) (exports the `Pagination` interface, used for typing only)

Any endpoint that returns a paginated list (e.g. `GET /api/v1/users/instructors`) nests a `pagination` field inside `data`, alongside the list itself, matching this exact interface:

```ts
interface Pagination {
  page: number;
  limit: number;
  totalDocuments: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
```

Example response for `GET /api/v1/users/instructors?page=2&limit=10`:

```json
{
  "status": "success",
  "message": "Instructors fetched successfully",
  "data": {
    "instructors": [ /* array of instructor documents */ ],
    "pagination": {
      "page": 2,
      "limit": 10,
      "totalDocuments": 23,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPrevPage": true
    }
  }
}
```

**Key points:**
- `pagination` lives inside `data`, as a sibling of the list field (e.g. `data: { instructors, pagination }`) — it is **not** a top-level field on the response.
- The service computes `pagination` (via a `$count` aggregation alongside the `$skip`/`$limit` stage); the controller nests it into the `data` object it builds.
- Because `sendResponse`'s `data` is typed as `unknown`, TypeScript does **not** validate the shape of `pagination` (or anything else inside `data`) at the `sendResponse` call site — the `Pagination` interface is available to import for manual annotation if stricter checking is ever wanted, but it isn't enforced automatically.

---

## Full Example: `POST /api/v1/auth/signup`

```
Client sends:  POST /api/v1/auth/signup  { "email": "...", "password": "..." }
       │
       ▼
[authRouter]            matches route → runs middleware chain
       │
       ▼
[validationMiddleware]  safeParse(req.body)
       ├── FAIL  → next(AppError 400 "Validation failed" + field errors) ──► [globalErrorHandler]
       └── PASS  → req.body = parsed data → next()
       │
       ▼
[catchAsync → signup]   reads body, calls signupService(body)
       │
       ▼
[signupService]         business logic
       ├── throws AppError  → caught by catchAsync → next(err) ──► [globalErrorHandler]
       └── resolves data    → controller calls sendResponse(res, 201, { ..., data })
       │
       ▼
[sendResponse]          res.status(201).json({ status, message, data })
       │
       ▼
Client receives JSON response
```
