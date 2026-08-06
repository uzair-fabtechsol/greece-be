import type { S3Folder } from "@src/constants/s3Constant";

interface GetPresignedUrlBody {
  folder: S3Folder;
  fileName: string;
  fileType: string;
}

export type { GetPresignedUrlBody };
