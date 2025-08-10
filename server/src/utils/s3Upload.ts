import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

export const uploadFiles = async (
  files: Express.Multer.File[]
): Promise<string[]> => {
  const { AWS_REGION, S3_BUCKET_NAME } = process.env;
  if (!AWS_REGION || !S3_BUCKET_NAME) {
    throw new Error("Missing AWS_REGION or S3_BUCKET_NAME environment variables");
  }

  const s3Client = new S3Client({ region: AWS_REGION });

  return Promise.all(
    files.map(async (file) => {
      const uploadParams = {
        Bucket: S3_BUCKET_NAME,
        Key: `properties/${Date.now()}-${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      const uploadResult = await new Upload({
        client: s3Client,
        params: uploadParams,
      }).done();

      return (uploadResult as any).Location as string;
    })
  );
};
