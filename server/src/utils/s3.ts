import { S3Client, PutObjectCommand, GetObjectCommand, PutBucketPolicyCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AWS_REGION, S3_BUCKET_NAME, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } from '../env';

const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

export const uploadToS3 = async (
  key: string,
  body: Buffer,
  contentType: string,
): Promise<string> => {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
  return `https://${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;
};

export const generateSignedUrl = (
  key: string,
  expiresIn = 60,
): Promise<string> => {
  const command = new GetObjectCommand({ Bucket: S3_BUCKET_NAME, Key: key });
  return getSignedUrl(s3Client, command, { expiresIn });
};

export const configureBucketPolicy = async (): Promise<void> => {
  const policy = {
    Version: '2012-10-17',
    Statement: [
      {
        Sid: 'AllowGetObject',
        Effect: 'Allow',
        Principal: '*',
        Action: ['s3:GetObject'],
        Resource: [`arn:aws:s3:::${S3_BUCKET_NAME}/*`],
      },
    ],
  };
  await s3Client.send(
    new PutBucketPolicyCommand({
      Bucket: S3_BUCKET_NAME,
      Policy: JSON.stringify(policy),
    }),
  );
};

export default s3Client;
