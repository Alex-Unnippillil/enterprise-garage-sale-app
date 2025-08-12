import type { Express } from 'express';
import { Upload } from '@aws-sdk/lib-storage';
import { S3_BUCKET_NAME } from '../env';
import s3Client from './s3Client';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const uploadFilesToS3 = async (files: Express.Multer.File[]): Promise<string[]> => {
  const bucket = S3_BUCKET_NAME;

  return Promise.all(
    files.map(async (file) => {
      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        throw new Error(`Invalid file type: ${file.mimetype}`);
      }

      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File too large: ${file.originalname}`);
      }

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
