import type { Express } from 'express';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { AWS_REGION, S3_BUCKET_NAME, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } from '../env';

// Only allow common image formats to prevent unexpected data uploads
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png'] as const;

// 5MB per file
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const uploadFilesToS3 = async (files: Express.Multer.File[]): Promise<string[]> => {
  files.forEach((file) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new Error(`Unsupported file type: ${file.mimetype}`);
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File too large: ${file.originalname}`);
    }
  });

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
    }),
  );
};

export default uploadFilesToS3;
