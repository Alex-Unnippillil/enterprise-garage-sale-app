import type { Express } from 'express';

process.env.PORT = '3000';
process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/db';
process.env.GEOCODE_USER_AGENT = 'test-agent';
process.env.COGNITO_AUDIENCE = 'aud';
process.env.COGNITO_ISSUER = 'issuer';
process.env.AWS_REGION = 'us-east-1';
process.env.S3_BUCKET_NAME = 'test-bucket';
process.env.AWS_ACCESS_KEY_ID = 'key';
process.env.AWS_SECRET_ACCESS_KEY = 'secret';
process.env.JWT_SECRET = 'jwt';

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(),
}));

const uploadMock = jest.fn();

jest.mock('@aws-sdk/lib-storage', () => ({
  Upload: uploadMock.mockImplementation(({ params }) => ({
    done: jest.fn().mockResolvedValue({ Location: `https://example.com/${params.Key}` }),
  })),
}));

import { uploadFilesToS3, MAX_FILE_SIZE } from '../s3-upload';
import { Upload } from '@aws-sdk/lib-storage';

describe('uploadFilesToS3', () => {
  const createFile = (overrides: Partial<Express.Multer.File> = {}): Express.Multer.File => ({
    originalname: 'test.jpg',
    mimetype: 'image/jpeg',
    size: 100,
    buffer: Buffer.from('data'),
    fieldname: 'file',
    encoding: '7bit',
    ...overrides,
  } as Express.Multer.File);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('rejects disallowed MIME types', async () => {
    const file = createFile({ mimetype: 'text/plain', originalname: 'test.txt' });
    await expect(uploadFilesToS3([file])).rejects.toThrow('Unsupported file type');
  });

  it('rejects files exceeding MAX_FILE_SIZE', async () => {
    const file = createFile({ size: MAX_FILE_SIZE + 1 });
    await expect(uploadFilesToS3([file])).rejects.toThrow('File too large');
  });

  it('uses properties/ prefix for S3 key', async () => {
    const file = createFile();
    await uploadFilesToS3([file]);
    const params = (Upload as jest.Mock).mock.calls[0][0].params;
    expect(params.Key.startsWith('properties/')).toBe(true);
  });
});

