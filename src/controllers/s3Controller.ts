import type { Request, Response } from "express";
import catchAsync from "@src/utils/catchAsync";
import sendResponse from "@src/utils/sendResponse";
import { getPresignedUrlService } from "@src/services/s3Services";
import type { GetPresignedUrlBody } from "@src/types/s3Types";

// FUNCTION
const getPresignedUrl = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const body = req.body as GetPresignedUrlBody;

    const data = await getPresignedUrlService(body);

    sendResponse(res, 200, {
      status: "success",
      message: "Presigned URL generated successfully",
      data,
    });
  },
);

export { getPresignedUrl };
