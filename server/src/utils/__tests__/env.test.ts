import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';

describe('env validation', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it('returns parsed env on success', () => {
    Object.assign(process.env, {
      DATABASE_URL: 'https://example.com',
      PORT: '3000',
      GEOCODE_USER_AGENT: 'test-agent',
      COGNITO_JWT_PUBLIC_KEY: 'key',
      COGNITO_AUDIENCE: 'aud',
      COGNITO_ISSUER: 'issuer',
      S3_BUCKET_NAME: 'bucket',
      S3_REGION: 'us-east-1',
    });

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const env = require('../env').default;
    expect(env.PORT).toBe(3000);
    expect(env.DATABASE_URL).toBe('https://example.com');
  });

  it('throws when required var missing', () => {
    Object.assign(process.env, {
      PORT: '3000',
      GEOCODE_USER_AGENT: 'test-agent',
      COGNITO_JWT_PUBLIC_KEY: 'key',
      COGNITO_AUDIENCE: 'aud',
      COGNITO_ISSUER: 'issuer',
      S3_BUCKET_NAME: 'bucket',
      S3_REGION: 'us-east-1',
    });

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    expect(() => require('../env')).toThrow();
  });
});
