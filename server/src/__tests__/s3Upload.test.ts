jest.mock('../env', () => ({
  AWS_REGION: 'us-east-1',
  S3_BUCKET_NAME: 'test-bucket',
  AWS_ACCESS_KEY_ID: 'test',
  AWS_SECRET_ACCESS_KEY: 'secret',
}));

jest.mock('@aws-sdk/lib-storage', () => ({
  Upload: jest.fn().mockImplementation(() => ({
    done: jest.fn().mockResolvedValue({ Location: 'https://example.com/file' }),
  })),
}));

import { uploadFilesToS3 } from '../utils/s3Upload';

describe('uploadFilesToS3 validation', () => {
  it('throws error for invalid file type', async () => {
    const file: any = {
      originalname: 'file.txt',
      mimetype: 'text/plain',
      size: 100,
      buffer: Buffer.from('a'),
    };
    await expect(uploadFilesToS3([file])).rejects.toThrow('Invalid file type');
  });

  it('throws error for oversized file', async () => {
    const file: any = {
      originalname: 'big.png',
      mimetype: 'image/png',
      size: 6 * 1024 * 1024,
      buffer: Buffer.from('a'),
    };
    await expect(uploadFilesToS3([file])).rejects.toThrow('File too large');
  });
});
