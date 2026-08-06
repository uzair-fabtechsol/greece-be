import { z } from "zod";

// FUNCTION
// Parses a comma-separated query param (e.g. "id1,id2") into a validated,
// non-empty array of trimmed strings, so a single filter field can match
// against multiple values via $in.
const csvQueryParam = (itemSchema: z.ZodString) => {
  return z
    .string()
    .trim()
    .transform((value) =>
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    )
    .pipe(z.array(itemSchema).min(1))
    .optional();
};

export { csvQueryParam };
