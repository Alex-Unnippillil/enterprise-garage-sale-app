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
      PORT: '3000',
      DATABASE_URL: 'https://example.com',
      GEOCODE_USER_AGENT: 'agent',
      COGNITO_AUDIENCE: 'aud',
      COGNITO_ISSUER: 'issuer',
      AWS_REGION: 'us-east-1',
      S3_BUCKET_NAME: 'bucket',
      AWS_ACCESS_KEY_ID: 'key',
      AWS_SECRET_ACCESS_KEY: 'secret',
      CLIENT_ORIGIN: 'http://localhost:3000',
      STRIPE_SECRET_KEY: 'sk',
      STRIPE_WEBHOOK_SECRET: 'wh',
    });
    const env = require('../../env').default;
    expect(env.PORT).toBe(3000);
    expect(env.DATABASE_URL).toBe('https://example.com');
  });

  it('throws when required var missing', () => {
    delete process.env.DATABASE_URL;
    expect(() => require('../../env')).toThrow();
  });
});
