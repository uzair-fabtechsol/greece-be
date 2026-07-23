import type { S3Folder } from "@src/constants/s3Constants";

interface GetPresignedUrlBody {
  folder: S3Folder;
  fileName: string;
  fileType: string;
}

export type { GetPresignedUrlBody };
