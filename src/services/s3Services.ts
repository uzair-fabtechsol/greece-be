import { randomUUID } from "crypto";
import { PutObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "@src/config/s3";
import { env } from "@src/config/env";
import { PRESIGNED_URL_EXPIRY_SECONDS } from "@src/constants/s3Constants";
import type { GetPresignedUrlBody } from "@src/types/s3Types";

// FUNCTION
const extractS3KeyFromUrl = (url: string): string => {
  return decodeURIComponent(new URL(url).pathname.slice(1));
};

// FUNCTION
const getPresignedUrlService = async (
  body: GetPresignedUrlBody,
): Promise<{ uploadUrl: string; publicUrl: string }> => {
  const { folder, fileName, fileType } = body;

  const key = `${folder}/${randomUUID()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: env.AWS_S3_BUCKET_NAME,
    Key: key,
    ContentType: fileType,
    ACL: "public-read",
  });

  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: PRESIGNED_URL_EXPIRY_SECONDS,
  });

  const publicUrl = `https://${env.AWS_S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;

  return { uploadUrl, publicUrl };
};

// FUNCTION
const deleteImagesFromS3 = async (urls: string[]): Promise<void> => {
  if (urls.length === 0) return;

  const keys = urls.map(extractS3KeyFromUrl);

  await s3Client.send(
    new DeleteObjectsCommand({
      Bucket: env.AWS_S3_BUCKET_NAME,
      Delete: {
        Objects: keys.map((Key) => ({ Key })),
      },
    }),
  );
};

export { getPresignedUrlService, deleteImagesFromS3 };
