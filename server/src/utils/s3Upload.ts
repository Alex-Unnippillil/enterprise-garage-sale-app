import type { Express } from "express";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

const requiredEnv = [
  "AWS_REGION",
  "S3_BUCKET_NAME",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
];

export const validateS3Env = (): void => {
  const missing = requiredEnv.filter((v) => !process.env[v]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
};

export const uploadFilesToS3 = async (
  files: Express.Multer.File[],
): Promise<string[]> => {
  validateS3Env();
  const s3Client = new S3Client({ region: process.env.AWS_REGION });
  const bucket = process.env.S3_BUCKET_NAME!;

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
