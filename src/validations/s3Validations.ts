import { z } from "zod";
import { S3Folder, ALLOWED_IMAGE_MIME_TYPES } from "@src/constants/s3Constants";

const getPresignedUrlSchema = z.object({
  folder: z.enum(S3Folder),
  fileName: z.string().trim().min(1),
  fileType: z.enum(ALLOWED_IMAGE_MIME_TYPES as [string, ...string[]]),
});

export { getPresignedUrlSchema };
