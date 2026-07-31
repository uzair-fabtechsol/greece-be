export {};

declare global {
  namespace Express {
    interface Request {
      validatedBody?: unknown;
      validatedQuery?: unknown;
      validatedParams?: unknown;
      user?: {
        _id: string;
        role: string;
      };
    }
  }
}
