import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});

export const uploadFile = async (
  file: Express.Multer.File
): Promise<string> => {
  const uploadParams = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: `properties/${Date.now()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const uploadResult = await new Upload({
    client: s3Client,
    params: uploadParams,
  }).done();

  return (uploadResult as any).Location as string;
};
