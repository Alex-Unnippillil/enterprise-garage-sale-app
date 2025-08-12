import type { Express } from "express";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import {
  AWS_REGION,
  S3_BUCKET_NAME,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
} from "../env";

export const uploadFilesToS3 = async (
  files: Express.Multer.File[],
): Promise<string[]> => {
  const s3Client = new S3Client({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  });
  const bucket = S3_BUCKET_NAME;

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
