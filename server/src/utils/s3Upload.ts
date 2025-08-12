import type { Express } from "express";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import env from "../utils/env";

export const uploadFilesToS3 = async (
  files: Express.Multer.File[],
): Promise<string[]> => {
  const s3Client = new S3Client({
    region: env.S3_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });
  const bucket = env.S3_BUCKET_NAME;

  return Promise.all(
    files.map(async (file) => {
      const uploadResult = await new Upload({
        client: s3Client,
        params: {
          Bucket: bucket,
          Key: `properties/${Date.now()}-${file.originalname}`,
          Body: file.buffer,
          ContentType: file.mimetype,
        },
      }).done();

      return uploadResult.Location as string;
    })
  );
};

export default uploadFilesToS3;
